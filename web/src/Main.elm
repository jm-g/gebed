module Main exposing (main)

import Board
import Browser
import Browser.Events
import Html exposing (Html, div, li, span, text, ul)
import Html.Attributes exposing (class, classList)
import Html.Events exposing (onClick)
import Http
import Json.Decode as D
import Keys exposing (Action(..), Outcome(..), View(..))
import Theme
import Types exposing (Bead, Repo, statusLabel)


type Loaded a
    = Loading
    | Failed String
    | Ready a


type alias Model =
    { repos : Loaded (List Repo)
    , current : Maybe String
    , beads : Loaded (List Bead)
    , themes : List Theme.Scheme
    , themeIdx : Int
    , view : View
    , sel : Int
    , pending : List String
    , help : Bool
    }


type Msg
    = GotRepos (Result Http.Error (List Repo))
    | GotBeads String (Result Http.Error (List Bead))
    | GotThemes (Result Http.Error (List Theme.Scheme))
    | Pick String
    | Key String


main : Program () Model Msg
main =
    Browser.element
        { init =
            \_ ->
                ( { repos = Loading
                  , current = Nothing
                  , beads = Loading
                  , themes = []
                  , themeIdx = 0
                  , view = ListView
                  , sel = 0
                  , pending = []
                  , help = False
                  }
                , Cmd.batch [ getRepos, getThemes ]
                )
        , update = update
        , view = view
        , subscriptions = \_ -> Browser.Events.onKeyDown keyDecoder
        }


{-| Plain keys only: chords with ctrl/alt/meta stay with the browser.
-}
keyDecoder : D.Decoder Msg
keyDecoder =
    D.map4
        (\k c a m ->
            if c || a || m then
                Nothing

            else
                Just k
        )
        (D.field "key" D.string)
        (D.field "ctrlKey" D.bool)
        (D.field "altKey" D.bool)
        (D.field "metaKey" D.bool)
        |> D.andThen
            (\mk ->
                case mk of
                    Just k ->
                        D.succeed (Key k)

                    Nothing ->
                        D.fail "chord"
            )


getRepos : Cmd Msg
getRepos =
    Http.get { url = "/api/repos", expect = Http.expectJson GotRepos (D.list Types.repoDecoder) }


getThemes : Cmd Msg
getThemes =
    Http.get { url = "/api/themes", expect = Http.expectJson GotThemes (D.list Theme.decoder) }


getBeads : String -> Cmd Msg
getBeads name =
    Http.get
        { url = "/api/repos/" ++ name ++ "/beads"
        , expect = Http.expectJson (GotBeads name) (D.list Types.beadDecoder)
        }


count : Model -> Int
count model =
    case model.beads of
        Ready bs ->
            List.length bs

        _ ->
            0


clamp : Model -> Model
clamp model =
    { model | sel = max 0 (min (count model - 1) model.sel) }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotRepos (Ok repos) ->
            case List.head repos of
                Just first ->
                    ( { model | repos = Ready repos, current = Just first.name }, getBeads first.name )

                Nothing ->
                    ( { model | repos = Ready repos }, Cmd.none )

        GotRepos (Err e) ->
            ( { model | repos = Failed (httpError e) }, Cmd.none )

        GotThemes (Ok ts) ->
            ( { model | themes = ts }, Cmd.none )

        GotThemes (Err _) ->
            -- the css defaults stay in effect
            ( model, Cmd.none )

        Pick name ->
            ( { model | current = Just name, beads = Loading, sel = 0 }, getBeads name )

        GotBeads name result ->
            if model.current /= Just name then
                -- a slower reply for a repo we left
                ( model, Cmd.none )

            else
                case result of
                    Ok bs ->
                        ( clamp { model | beads = Ready bs }, Cmd.none )

                    Err e ->
                        ( { model | beads = Failed (httpError e) }, Cmd.none )

        Key k ->
            case Keys.press model.pending k of
                Wait p ->
                    ( { model | pending = p }, Cmd.none )

                Cancel ->
                    ( { model | pending = [], help = False }, Cmd.none )

                Run a ->
                    run a { model | pending = [] }


run : Action -> Model -> ( Model, Cmd Msg )
run action model =
    case action of
        Down ->
            ( clamp { model | sel = model.sel + 1 }, Cmd.none )

        Up ->
            ( clamp { model | sel = model.sel - 1 }, Cmd.none )

        Top ->
            ( { model | sel = 0 }, Cmd.none )

        Bottom ->
            ( clamp { model | sel = count model - 1 }, Cmd.none )

        Show v ->
            ( { model | view = v }, Cmd.none )

        NextTheme ->
            ( { model | themeIdx = modBy (max 1 (List.length model.themes)) (model.themeIdx + 1) }, Cmd.none )

        Reload ->
            case model.current of
                Just name ->
                    ( model, getBeads name )

                Nothing ->
                    ( model, Cmd.none )

        Help ->
            ( { model | help = not model.help }, Cmd.none )


httpError : Http.Error -> String
httpError e =
    case e of
        Http.BadUrl u ->
            "bad url " ++ u

        Http.Timeout ->
            "timeout"

        Http.NetworkError ->
            "network error"

        Http.BadStatus code ->
            "status " ++ String.fromInt code

        Http.BadBody b ->
            b


view : Model -> Html Msg
view model =
    let
        themeVars =
            model.themes
                |> List.drop model.themeIdx
                |> List.head
                |> Maybe.map Theme.vars
                |> Maybe.withDefault []
    in
    div (class "app" :: themeVars)
        [ div [ class "sidebar" ] (loaded model.repos (viewRepos model.current))
        , div [ class "main" ] (loaded model.beads (viewBody model))
        , viewPopup model
        ]


loaded : Loaded b -> (b -> List (Html Msg)) -> List (Html Msg)
loaded l f =
    case l of
        Loading ->
            [ text "loading…" ]

        Failed e ->
            [ div [ class "error" ] [ text e ] ]

        Ready v ->
            f v


viewPopup : Model -> Html Msg
viewPopup model =
    let
        rows =
            if model.help then
                Keys.hints []

            else
                Keys.hints model.pending
    in
    if List.isEmpty model.pending && not model.help then
        text ""

    else
        div [ class "whichkey" ]
            (List.map
                (\( k, label ) -> span [ class "wk" ] [ span [ class "key" ] [ text k ], text (" " ++ label) ])
                rows
            )


viewRepos : Maybe String -> List Repo -> List (Html Msg)
viewRepos current repos =
    [ ul [] (List.map (repoItem current) repos) ]


repoItem : Maybe String -> Repo -> Html Msg
repoItem current r =
    li [ classList [ ( "current", current == Just r.name ) ], onClick (Pick r.name) ]
        [ text r.name, span [ class "dim" ] [ text (" " ++ r.backend) ] ]


viewBody : Model -> List Bead -> List (Html Msg)
viewBody model beads =
    let
        selected =
            Board.ordered beads |> List.drop model.sel |> List.head |> Maybe.map .id
    in
    case model.view of
        ListView ->
            [ ul [ class "beads" ] (List.map (beadRow selected) (Board.ordered beads)) ]

        KanbanView ->
            [ div [ class "kanban" ] (List.map (column selected) (Board.columns beads)) ]


beadRow : Maybe String -> Bead -> Html Msg
beadRow selected b =
    li [ classList [ ( "current", selected == Just b.id ) ] ]
        [ span [ class "id" ] [ text b.id ]
        , span [ class "status" ] [ text (statusLabel b.status) ]
        , span [ class "prio" ] [ text ("P" ++ String.fromInt b.priority) ]
        , span [ class "title" ] [ text b.title ]
        , span [ class "labels dim" ] [ text (String.join " " b.labels) ]
        ]


column : Maybe String -> ( String, List Bead ) -> Html Msg
column selected ( label, beads ) =
    div [ class "col" ]
        (div [ class "colhead" ] [ text (label ++ " " ++ String.fromInt (List.length beads)) ]
            :: List.map (card selected) beads
        )


card : Maybe String -> Bead -> Html Msg
card selected b =
    div [ classList [ ( "card", True ), ( "current", selected == Just b.id ) ] ]
        [ span [ class "id" ] [ text b.id ]
        , span [ class "prio" ] [ text (" P" ++ String.fromInt b.priority) ]
        , div [] [ text b.title ]
        , div [ class "labels dim" ] [ text (String.join " " b.labels) ]
        ]
