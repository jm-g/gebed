module Main exposing (main)

import Browser
import Html exposing (Html, div, li, span, text, ul)
import Html.Attributes exposing (class, classList)
import Html.Events exposing (onClick)
import Http
import Json.Decode as D
import Types exposing (Bead, Repo, statusLabel)


type Loaded a
    = Loading
    | Failed String
    | Ready a


type alias Model =
    { repos : Loaded (List Repo)
    , current : Maybe String
    , beads : Loaded (List Bead)
    }


type Msg
    = GotRepos (Result Http.Error (List Repo))
    | GotBeads String (Result Http.Error (List Bead))
    | Pick String


main : Program () Model Msg
main =
    Browser.element
        { init = \_ -> ( { repos = Loading, current = Nothing, beads = Loading }, getRepos )
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }


getRepos : Cmd Msg
getRepos =
    Http.get { url = "/api/repos", expect = Http.expectJson GotRepos (D.list Types.repoDecoder) }


getBeads : String -> Cmd Msg
getBeads name =
    Http.get
        { url = "/api/repos/" ++ name ++ "/beads"
        , expect = Http.expectJson (GotBeads name) (D.list Types.beadDecoder)
        }


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

        Pick name ->
            ( { model | current = Just name, beads = Loading }, getBeads name )

        GotBeads name result ->
            if model.current /= Just name then
                -- a slower reply for a repo we left
                ( model, Cmd.none )

            else
                case result of
                    Ok bs ->
                        ( { model | beads = Ready bs }, Cmd.none )

                    Err e ->
                        ( { model | beads = Failed (httpError e) }, Cmd.none )


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
    div [ class "app" ]
        [ div [ class "sidebar" ] (loaded model.repos (viewRepos model.current))
        , div [ class "main" ] (loaded model.beads viewBeads)
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


viewRepos : Maybe String -> List Repo -> List (Html Msg)
viewRepos current repos =
    [ ul [] (List.map (repoItem current) repos) ]


repoItem : Maybe String -> Repo -> Html Msg
repoItem current r =
    li [ classList [ ( "current", current == Just r.name ) ], onClick (Pick r.name) ]
        [ text r.name, span [ class "dim" ] [ text (" " ++ r.backend) ] ]


viewBeads : List Bead -> List (Html Msg)
viewBeads beads =
    [ ul [ class "beads" ] (List.map beadRow beads) ]


beadRow : Bead -> Html Msg
beadRow b =
    li []
        [ span [ class "id" ] [ text b.id ]
        , span [ class "status" ] [ text (statusLabel b.status) ]
        , span [ class "prio" ] [ text ("P" ++ String.fromInt b.priority) ]
        , span [ class "title" ] [ text b.title ]
        , span [ class "labels dim" ] [ text (String.join " " b.labels) ]
        ]
