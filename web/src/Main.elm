module Main exposing (main)

import Board
import Browser
import Browser.Dom as Dom
import Browser.Events
import Html exposing (Html, div, li, span, text, textarea, ul)
import Html.Attributes as A exposing (class, classList)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as D
import Json.Encode as E
import Keys exposing (Action(..), ComposeKind(..), Outcome(..), View(..))
import Task
import Theme
import Time
import Types exposing (Bead, Comment, Delivery, Repo, Session, statusLabel)


type Loaded a
    = Loading
    | Failed String
    | Ready a


type alias Composer =
    { kind : ComposeKind
    , target : String
    , text : String
    }


type alias Detail =
    { id : String
    , bead : Loaded Bead
    , comments : Loaded (List Comment)
    }


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
    , detail : Maybe Detail
    , compose : Maybe Composer
    , sessions : List Session
    , version : Maybe String
    , flash : Maybe String
    }


type alias OpResult =
    { id : String
    , delivered : List Delivery
    }


type Msg
    = GotRepos (Result Http.Error (List Repo))
    | GotBeads String (Result Http.Error (List Bead))
    | GotThemes (Result Http.Error (List Theme.Scheme))
    | GotBead String (Result Http.Error Bead)
    | GotComments String (Result Http.Error (List Comment))
    | GotSessions (Result Http.Error (List Session))
    | GotVersion String (Result Http.Error String)
    | OpDone (Result String OpResult)
    | Pick String
    | Key String
    | Tick Time.Posix
    | Draft String
    | Submit
    | CancelCompose
    | Mention String
    | NoOp


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
                  , detail = Nothing
                  , compose = Nothing
                  , sessions = []
                  , version = Nothing
                  , flash = Nothing
                  }
                , Cmd.batch [ getRepos, getThemes ]
                )
        , update = update
        , view = view
        , subscriptions =
            \_ ->
                Sub.batch
                    [ Browser.Events.onKeyDown keyDecoder
                    , Time.every 2000 Tick
                    ]
        }


{-| Plain keys only: chords with ctrl/alt/meta stay with the browser, and keys
typed into the composer belong to the textarea.
-}
keyDecoder : D.Decoder Msg
keyDecoder =
    D.map5
        (\k c a m tag ->
            if c || a || m || tag == "TEXTAREA" then
                Nothing

            else
                Just k
        )
        (D.field "key" D.string)
        (D.field "ctrlKey" D.bool)
        (D.field "altKey" D.bool)
        (D.field "metaKey" D.bool)
        (D.at [ "target", "tagName" ] D.string)
        |> D.andThen
            (\mk ->
                case mk of
                    Just k ->
                        D.succeed (Key k)

                    Nothing ->
                        D.fail "not a navigation key"
            )


composerKeys : D.Decoder Msg
composerKeys =
    D.map2 Tuple.pair (D.field "key" D.string) (D.field "ctrlKey" D.bool)
        |> D.andThen
            (\( k, ctrl ) ->
                if k == "Escape" then
                    D.succeed CancelCompose

                else if k == "Enter" && ctrl then
                    D.succeed Submit

                else
                    D.fail "typing"
            )



-- HTTP


repoUrl : String -> String -> String
repoUrl name rest =
    "/api/repos/" ++ name ++ rest


getRepos : Cmd Msg
getRepos =
    Http.get { url = "/api/repos", expect = Http.expectJson GotRepos (D.list Types.repoDecoder) }


getThemes : Cmd Msg
getThemes =
    Http.get { url = "/api/themes", expect = Http.expectJson GotThemes (D.list Theme.decoder) }


getBeads : String -> Cmd Msg
getBeads name =
    Http.get
        { url = repoUrl name "/beads"
        , expect = Http.expectJson (GotBeads name) (D.list Types.beadDecoder)
        }


getBead : String -> String -> Cmd Msg
getBead name id =
    Http.get
        { url = repoUrl name ("/beads/" ++ id)
        , expect = Http.expectJson (GotBead id) Types.beadDecoder
        }


getComments : String -> String -> Cmd Msg
getComments name id =
    Http.get
        { url = repoUrl name ("/beads/" ++ id ++ "/comments")
        , expect = Http.expectJson (GotComments id) (D.list Types.commentDecoder)
        }


getSessions : Cmd Msg
getSessions =
    Http.get { url = "/api/sessions", expect = Http.expectJson GotSessions (D.list Types.sessionDecoder) }


getVersion : String -> Cmd Msg
getVersion name =
    Http.get
        { url = repoUrl name "/version"
        , expect = Http.expectJson (GotVersion name) (D.field "v" D.string)
        }


{-| Post one edit. The server answers 422 with {"error": ...} for invalid input;
that text reaches the user as is.
-}
postOp : String -> List ( String, E.Value ) -> Cmd Msg
postOp repo fields =
    Http.post
        { url = repoUrl repo "/ops"
        , body = Http.jsonBody (E.object fields)
        , expect = expectOp
        }


expectOp : Http.Expect Msg
expectOp =
    Http.expectStringResponse OpDone
        (\response ->
            case response of
                Http.GoodStatus_ _ body ->
                    D.decodeString opResultDecoder body |> Result.mapError D.errorToString

                Http.BadStatus_ _ body ->
                    Err (D.decodeString (D.field "error" D.string) body |> Result.withDefault body)

                Http.BadUrl_ u ->
                    Err ("bad url " ++ u)

                Http.Timeout_ ->
                    Err "timeout"

                Http.NetworkError_ ->
                    Err "network error"
        )


opResultDecoder : D.Decoder OpResult
opResultDecoder =
    D.map2 OpResult
        (D.field "id" D.string)
        (D.field "delivered" (D.list Types.deliveryDecoder))



-- STATE HELPERS


ordered : Model -> List Bead
ordered model =
    case model.beads of
        Ready bs ->
            Board.ordered bs

        _ ->
            []


selected : Model -> Maybe Bead
selected model =
    ordered model |> List.drop model.sel |> List.head


clamp : Model -> Model
clamp model =
    { model | sel = max 0 (min (List.length (ordered model) - 1) model.sel) }


{-| The bead an edit applies to: the open discussion, else the selection.
-}
target : Model -> Maybe Bead
target model =
    case model.detail of
        Just d ->
            case d.bead of
                Ready b ->
                    Just b

                _ ->
                    selected model

        Nothing ->
            selected model


focusComposer : Cmd Msg
focusComposer =
    Dom.focus "composer" |> Task.attempt (\_ -> NoOp)


refresh : Model -> Cmd Msg
refresh model =
    case model.current of
        Nothing ->
            Cmd.none

        Just name ->
            Cmd.batch
                (getBeads name
                    :: (case model.detail of
                            Just d ->
                                [ getBead name d.id, getComments name d.id ]

                            Nothing ->
                                []
                       )
                )



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

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

        GotSessions (Ok ss) ->
            ( { model | sessions = ss }, Cmd.none )

        GotSessions (Err _) ->
            ( { model | sessions = [] }, Cmd.none )

        Pick name ->
            ( { model | current = Just name, beads = Loading, sel = 0, detail = Nothing, version = Nothing }
            , getBeads name
            )

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

        GotBead id result ->
            ( withDetail id (\d -> { d | bead = toLoaded result }) model, Cmd.none )

        GotComments id result ->
            ( withDetail id (\d -> { d | comments = toLoaded result }) model, Cmd.none )

        Tick _ ->
            case model.current of
                Just name ->
                    ( model, getVersion name )

                Nothing ->
                    ( model, Cmd.none )

        GotVersion name (Ok v) ->
            if model.current /= Just name || model.version == Just v then
                ( model, Cmd.none )

            else
                let
                    next =
                        { model | version = Just v }
                in
                -- the first version only sets the baseline; later ones mean a write
                ( next
                , if model.version == Nothing then
                    Cmd.none

                  else
                    refresh next
                )

        GotVersion _ (Err _) ->
            ( model, Cmd.none )

        Key k ->
            case Keys.press model.pending k of
                Wait p ->
                    ( { model | pending = p }, Cmd.none )

                Cancel ->
                    if List.isEmpty model.pending && not model.help then
                        ( { model | detail = Nothing, flash = Nothing }, Cmd.none )

                    else
                        ( { model | pending = [], help = False }, Cmd.none )

                Run a ->
                    run a { model | pending = [], flash = Nothing }

        Draft s ->
            ( { model | compose = Maybe.map (\c -> { c | text = s }) model.compose }, Cmd.none )

        Mention nick ->
            ( { model
                | compose =
                    Maybe.map
                        (\c ->
                            { c
                                | text =
                                    c.text
                                        ++ (if String.isEmpty c.text || String.endsWith " " c.text then
                                                ""

                                            else
                                                " "
                                           )
                                        ++ "@"
                                        ++ nick
                                        ++ " "
                            }
                        )
                        model.compose
              }
            , focusComposer
            )

        CancelCompose ->
            ( { model | compose = Nothing }, Cmd.none )

        Submit ->
            case ( model.compose, model.current ) of
                ( Just c, Just repo ) ->
                    ( model, postOp repo (composeFields c) )

                _ ->
                    ( model, Cmd.none )

        OpDone (Ok r) ->
            let
                next =
                    { model | compose = Nothing, flash = Just (deliveryNote r.delivered) }
            in
            ( next, refresh next )

        OpDone (Err e) ->
            ( { model | flash = Just ("rejected: " ++ e) }, Cmd.none )


toLoaded : Result Http.Error a -> Loaded a
toLoaded r =
    case r of
        Ok v ->
            Ready v

        Err e ->
            Failed (httpError e)


withDetail : String -> (Detail -> Detail) -> Model -> Model
withDetail id f model =
    case model.detail of
        Just d ->
            if d.id == id then
                { model | detail = Just (f d) }

            else
                model

        Nothing ->
            model


deliveryNote : List Delivery -> String
deliveryNote ds =
    if List.isEmpty ds then
        "saved"

    else
        "saved; "
            ++ String.join ", "
                (List.map
                    (\d ->
                        if d.delivered then
                            "@" ++ d.name ++ " got it"

                        else
                            "@" ++ d.name ++ ": " ++ d.error
                    )
                    ds
                )


composeFields : Composer -> List ( String, E.Value )
composeFields c =
    case c.kind of
        NewBead ->
            [ ( "op", E.string "create" ), ( "title", E.string c.text ), ( "kind", E.string "task" ), ( "priority", E.int 2 ) ]

        Rename ->
            [ ( "op", E.string "setTitle" ), ( "id", E.string c.target ), ( "title", E.string c.text ) ]

        _ ->
            [ ( "op", E.string "addComment" ), ( "id", E.string c.target ), ( "text", E.string c.text ) ]


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
            ( clamp { model | sel = List.length (ordered model) - 1 }, Cmd.none )

        Show v ->
            ( { model | view = v }, Cmd.none )

        NextTheme ->
            ( { model | themeIdx = modBy (max 1 (List.length model.themes)) (model.themeIdx + 1) }, Cmd.none )

        Reload ->
            ( model, refresh model )

        Help ->
            ( { model | help = not model.help }, Cmd.none )

        OpenDetail ->
            case ( selected model, model.current ) of
                ( Just b, Just repo ) ->
                    ( { model | detail = Just { id = b.id, bead = Ready b, comments = Loading } }
                    , Cmd.batch [ getBead repo b.id, getComments repo b.id ]
                    )

                _ ->
                    ( model, Cmd.none )

        Compose NewBead ->
            ( { model | compose = Just { kind = NewBead, target = "", text = "" } }, focusComposer )

        Compose kind ->
            case target model of
                Just b ->
                    let
                        start =
                            case kind of
                                Ask ->
                                    if String.isEmpty b.assignee then
                                        ""

                                    else
                                        "@" ++ b.assignee ++ " "

                                Rename ->
                                    b.title

                                _ ->
                                    ""
                    in
                    ( { model | compose = Just { kind = kind, target = b.id, text = start } }
                    , Cmd.batch [ focusComposer, getSessions ]
                    )

                Nothing ->
                    ( model, Cmd.none )

        SetStatus "closed" ->
            edit model (\b -> [ ( "op", E.string "close" ), ( "id", E.string b.id ) ])

        SetStatus s ->
            edit model (\b -> [ ( "op", E.string "setStatus" ), ( "id", E.string b.id ), ( "status", E.string s ) ])

        SetPriority n ->
            edit model (\b -> [ ( "op", E.string "setPriority" ), ( "id", E.string b.id ), ( "priority", E.int n ) ])

        Reopen ->
            edit model (\b -> [ ( "op", E.string "reopen" ), ( "id", E.string b.id ) ])


edit : Model -> (Bead -> List ( String, E.Value )) -> ( Model, Cmd Msg )
edit model fields =
    case ( target model, model.current ) of
        ( Just b, Just repo ) ->
            ( model, postOp repo (fields b) )

        _ ->
            ( model, Cmd.none )


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



-- VIEW


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
        , viewDetail model
        , viewFlash model
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


viewFlash : Model -> Html Msg
viewFlash model =
    case model.flash of
        Just s ->
            div [ class "flash" ] [ text s ]

        Nothing ->
            text ""


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
        sel =
            selected model |> Maybe.map .id
    in
    case model.view of
        ListView ->
            [ ul [ class "beads" ] (List.map (beadRow sel) (Board.ordered beads)) ]

        KanbanView ->
            [ div [ class "kanban" ] (List.map (column sel) (Board.columns beads)) ]


beadRow : Maybe String -> Bead -> Html Msg
beadRow sel b =
    li [ classList [ ( "current", sel == Just b.id ) ] ]
        [ span [ class "id" ] [ text b.id ]
        , span [ class "status" ] [ text (statusLabel b.status) ]
        , span [ class "prio" ] [ text ("P" ++ String.fromInt b.priority) ]
        , span [ class "title" ] [ text b.title ]
        , span [ class "labels dim" ] [ text (String.join " " b.labels) ]
        ]


column : Maybe String -> ( String, List Bead ) -> Html Msg
column sel ( label, beads ) =
    div [ class "col" ]
        (div [ class "colhead" ] [ text (label ++ " " ++ String.fromInt (List.length beads)) ]
            :: List.map (card sel) beads
        )


card : Maybe String -> Bead -> Html Msg
card sel b =
    div [ classList [ ( "card", True ), ( "current", sel == Just b.id ) ] ]
        [ span [ class "id" ] [ text b.id ]
        , span [ class "prio" ] [ text (" P" ++ String.fromInt b.priority) ]
        , div [] [ text b.title ]
        , div [ class "labels dim" ] [ text (String.join " " b.labels) ]
        ]


viewDetail : Model -> Html Msg
viewDetail model =
    case model.detail of
        Nothing ->
            case model.compose of
                Just c ->
                    div [ class "detail" ] [ viewComposer model c ]

                Nothing ->
                    text ""

        Just d ->
            div [ class "detail" ]
                (loaded d.bead (viewBeadHead model)
                    ++ [ div [ class "discussion" ] (loaded d.comments viewComments) ]
                    ++ [ viewComposerOrHint model ]
                )


viewBeadHead : Model -> Bead -> List (Html Msg)
viewBeadHead _ b =
    [ div [ class "dtitle" ] [ span [ class "id" ] [ text b.id ], text (" " ++ b.title) ]
    , div [ class "dmeta dim" ]
        [ text
            (String.join "  "
                [ statusLabel b.status
                , b.kind
                , "P" ++ String.fromInt b.priority
                , if String.isEmpty b.assignee then
                    "unassigned"

                  else
                    "@" ++ b.assignee
                ]
            )
        ]
    , if List.isEmpty b.labels then
        text ""

      else
        div [ class "dmeta dim" ] [ text (String.join " " (List.map (\l -> "#" ++ l) b.labels)) ]
    , if List.isEmpty b.deps then
        text ""

      else
        div [ class "dmeta" ] (text "depends on: " :: List.map (\dep -> span [ class "id" ] [ text (dep.on ++ " (" ++ dep.kind ++ ") ") ]) b.deps)
    , if String.isEmpty b.description then
        text ""

      else
        div [ class "ddesc" ] [ text b.description ]
    ]


viewComments : List Comment -> List (Html Msg)
viewComments cs =
    if List.isEmpty cs then
        [ div [ class "dim" ] [ text "no comments yet — c to comment, a to ask the implementer" ] ]

    else
        List.map
            (\c ->
                div [ class "comment" ]
                    [ div [ class "dim" ] [ span [ class "author" ] [ text c.author ], text ("  " ++ c.created) ]
                    , div [ class "ctext" ] [ text c.text ]
                    ]
            )
            cs


viewComposerOrHint : Model -> Html Msg
viewComposerOrHint model =
    case model.compose of
        Just c ->
            viewComposer model c

        Nothing ->
            div [ class "dim hint" ] [ text "c comment · a ask · SPC e … edit · Esc close" ]


viewComposer : Model -> Composer -> Html Msg
viewComposer model c =
    let
        label =
            case c.kind of
                NewBead ->
                    "new bead title"

                Discuss ->
                    "comment on " ++ c.target

                Ask ->
                    "ask on " ++ c.target ++ " — @name sends it to that session"

                Rename ->
                    "rename " ++ c.target
    in
    div [ class "composer" ]
        [ div [ class "dim" ] [ text (label ++ "   (Ctrl+Enter send, Esc cancel)") ]
        , textarea
            [ A.id "composer"
            , A.value c.text
            , A.rows 4
            , onInput Draft
            , Html.Events.on "keydown" composerKeys
            ]
            []
        , if List.isEmpty model.sessions || c.kind == NewBead || c.kind == Rename then
            text ""

          else
            div [ class "dim" ]
                (text "live sessions: "
                    :: List.map (\s -> span [ class "chip", onClick (Mention s.nick) ] [ text ("@" ++ s.nick) ]) model.sessions
                )
        ]
