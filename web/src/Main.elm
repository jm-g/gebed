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
import Layout
import Svg
import Svg.Attributes as SA
import Task
import Theme
import Time
import Types exposing (Bead, Comment, Delivery, Edge, Repo, Session, statusLabel)


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
    , edges : List Edge
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
    | GotEdges String (Result Http.Error (List Edge))
    | GotVersion String (Result Http.Error String)
    | OpDone (Result String OpResult)
    | RepoAdded (Result String String)
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
                  , edges = []
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


getEdges : String -> Cmd Msg
getEdges name =
    Http.get
        { url = repoUrl name "/edges"
        , expect = Http.expectJson (GotEdges name) (D.list Types.edgeDecoder)
        }


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
    expectApi OpDone opResultDecoder


{-| Read a JSON answer; a refusal carries {"error": ...}, which is returned as the message.
-}
expectApi : (Result String a -> Msg) -> D.Decoder a -> Http.Expect Msg
expectApi toMsg decoder =
    Http.expectStringResponse toMsg
        (\response ->
            case response of
                Http.GoodStatus_ _ body ->
                    D.decodeString decoder body |> Result.mapError D.errorToString

                Http.BadStatus_ _ body ->
                    Err (D.decodeString (D.field "error" D.string) body |> Result.withDefault body)

                Http.BadUrl_ u ->
                    Err ("bad url " ++ u)

                Http.Timeout_ ->
                    Err "timeout"

                Http.NetworkError_ ->
                    Err "network error"
        )


postRepo : String -> Cmd Msg
postRepo dir =
    Http.post
        { url = "/api/repos"
        , body = Http.jsonBody (E.object [ ( "dir", E.string (String.trim dir) ) ])
        , expect = expectApi RepoAdded (D.field "name" D.string)
        }


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
                    ++ (if model.view == GraphView then
                            [ getEdges name ]

                        else
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
            let
                keep =
                    List.filter (\r -> Just r.name == model.current) repos |> List.head
            in
            case ( keep, List.head repos ) of
                ( Just _, _ ) ->
                    ( { model | repos = Ready repos }, Cmd.none )

                ( Nothing, Just first ) ->
                    ( { model | repos = Ready repos, current = Just first.name, beads = Loading }, getBeads first.name )

                ( Nothing, Nothing ) ->
                    -- no repos: nothing to load, the main pane explains how to add one
                    ( { model | repos = Ready repos, current = Nothing, beads = Ready [] }, Cmd.none )

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

        GotEdges name (Ok es) ->
            if model.current == Just name then
                ( { model | edges = es }, Cmd.none )

            else
                ( model, Cmd.none )

        GotEdges _ (Err e) ->
            ( { model | flash = Just ("edges: " ++ httpError e) }, Cmd.none )

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
                ( Just { kind, text }, _ ) ->
                    if kind == AddRepo then
                        ( model, postRepo text )

                    else
                        case ( model.compose, model.current ) of
                            ( Just c, Just repo ) ->
                                ( model, postOp repo (composeFields c) )

                            _ ->
                                ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        RepoAdded (Ok name) ->
            ( { model | compose = Nothing, current = Just name, beads = Loading, sel = 0, detail = Nothing, version = Nothing, flash = Just ("added " ++ name) }
            , Cmd.batch [ getRepos, getBeads name ]
            )

        RepoAdded (Err e) ->
            ( { model | flash = Just ("not added: " ++ e) }, Cmd.none )

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

        Link ->
            [ ( "op", E.string "addDep" ), ( "from", E.string c.target ), ( "on", E.string (linkRef c.text) ), ( "type", E.string "blocks" ) ]

        AddLabel ->
            [ ( "op", E.string "addLabel" ), ( "id", E.string c.target ), ( "label", E.string (String.trim c.text) ) ]

        RemoveLabel ->
            [ ( "op", E.string "removeLabel" ), ( "id", E.string c.target ), ( "label", E.string (String.trim c.text) ) ]

        _ ->
            [ ( "op", E.string "addComment" ), ( "id", E.string c.target ), ( "text", E.string c.text ) ]


{-| What the user types for a link: `id` for this repo, `repo:id` for another
repo. br and bd store the second as `external:repo:id`.
-}
linkRef : String -> String
linkRef raw =
    let
        s =
            String.trim raw
    in
    if String.contains ":" s && not (String.startsWith "external:" s) then
        "external:" ++ s

    else
        s


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
            ( { model | view = v }
            , case ( v, model.current ) of
                ( GraphView, Just name ) ->
                    getEdges name

                _ ->
                    Cmd.none
            )

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

        Compose AddRepo ->
            ( { model | compose = Just { kind = AddRepo, target = "", text = "" } }, focusComposer )

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
        , div [ class "main" ] (viewMain model)
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
    if List.isEmpty beads then
        [ div [ class "empty" ] [ div [ class "dtitle" ] [ text "No beads in this repo yet" ], div [] [ text "Press n to create the first one." ] ] ]

    else
        viewBodyWith model beads


viewBodyWith : Model -> List Bead -> List (Html Msg)
viewBodyWith model beads =
    let
        sel =
            selected model |> Maybe.map .id
    in
    case model.view of
        ListView ->
            [ ul [ class "beads" ] (List.map (beadRow sel) (Board.ordered beads)) ]

        KanbanView ->
            [ div [ class "kanban" ] (List.map (column sel) (Board.columns beads)) ]

        GraphView ->
            [ viewGraph sel beads model.edges ]

        WaterfallView ->
            [ viewWaterfall sel beads ]


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

                AddRepo ->
                    "add a repo: full path of a directory that has a .beads folder"

                Link ->
                    c.target ++ " depends on … (bead id, or repo:id for another repo)"

                AddLabel ->
                    "add a label to " ++ c.target

                RemoveLabel ->
                    "remove a label from " ++ c.target
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



-- GRAPH AND WATERFALL


nodeW : Int
nodeW =
    210


nodeH : Int
nodeH =
    44


viewGraph : Maybe String -> List Bead -> List Edge -> Html Msg
viewGraph sel beads edges =
    let
        nodes =
            Layout.layers beads edges

        x n =
            24 + n.layer * (nodeW + 50)

        y n =
            24 + n.row * (nodeH + 16)

        at id =
            nodes |> List.filter (\n -> n.bead.id == id) |> List.head

        width =
            24 + (1 + (List.map .layer nodes |> List.maximum |> Maybe.withDefault 0)) * (nodeW + 50)

        height =
            48 + (1 + (List.map .row nodes |> List.maximum |> Maybe.withDefault 0)) * (nodeH + 16)

        link e =
            case ( e.toRepo, at e.to, at e.from ) of
                ( "", Just target_, Just from ) ->
                    let
                        x1 =
                            x target_ + nodeW

                        y1 =
                            y target_ + nodeH // 2

                        x2 =
                            x from

                        y2 =
                            y from + nodeH // 2

                        mid =
                            String.fromInt ((x1 + x2) // 2)
                    in
                    [ Svg.path
                        [ SA.d ("M" ++ String.fromInt x1 ++ "," ++ String.fromInt y1 ++ " C" ++ mid ++ "," ++ String.fromInt y1 ++ " " ++ mid ++ "," ++ String.fromInt y2 ++ " " ++ String.fromInt x2 ++ "," ++ String.fromInt y2)
                        , SA.class
                            (if e.kind == "blocks" || e.kind == "parent-child" then
                                "edge"

                             else
                                "edge soft"
                            )
                        ]
                        []
                    ]

                _ ->
                    []

        external n =
            edges
                |> List.filter (\e -> e.from == n.bead.id && e.toRepo /= "")
                |> List.map (\e -> "→ " ++ e.toRepo ++ ":" ++ e.to)
                |> String.join "  "

        node n =
            Svg.g []
                [ Svg.rect
                    [ SA.x (String.fromInt (x n))
                    , SA.y (String.fromInt (y n))
                    , SA.width (String.fromInt nodeW)
                    , SA.height (String.fromInt nodeH)
                    , SA.class
                        (if sel == Just n.bead.id then
                            "gnode current"

                         else
                            "gnode"
                        )
                    ]
                    []
                , Svg.text_ [ SA.x (String.fromInt (x n + 8)), SA.y (String.fromInt (y n + 17)), SA.class "gid" ]
                    [ Svg.text (n.bead.id ++ "  " ++ statusLabel n.bead.status) ]
                , Svg.text_ [ SA.x (String.fromInt (x n + 8)), SA.y (String.fromInt (y n + 33)), SA.class "gtitle" ]
                    [ Svg.text (String.left 28 n.bead.title) ]
                , Svg.text_ [ SA.x (String.fromInt (x n + 8)), SA.y (String.fromInt (y n + nodeH + 11)), SA.class "gext" ]
                    [ Svg.text (external n) ]
                ]
    in
    Svg.svg [ SA.width (String.fromInt width), SA.height (String.fromInt height), SA.class "graph" ]
        (List.concatMap link edges ++ List.map node nodes)


viewWaterfall : Maybe String -> List Bead -> Html Msg
viewWaterfall sel beads =
    div [ class "waterfall" ]
        (List.map
            (\b ->
                div [ classList [ ( "wrow", True ), ( "current", sel == Just b.bead.id ) ] ]
                    [ span [ class "wlabel" ] [ span [ class "id" ] [ text b.bead.id ], text (" " ++ String.left 30 b.bead.title) ]
                    , div [ class "wtrack" ]
                        [ div
                            [ class ("wbar " ++ statusClass b.bead)
                            , A.style "left" (String.fromFloat b.startPct ++ "%")
                            , A.style "width" (String.fromFloat b.widthPct ++ "%")
                            ]
                            []
                        ]
                    ]
            )
            (Layout.bars beads)
        )


statusClass : Bead -> String
statusClass b =
    case b.status of
        Types.Closed ->
            "done"

        Types.InProgress ->
            "doing"

        Types.Blocked ->
            "blocked"

        _ ->
            "todo"


{-| The main pane. With no repos it says how to add one, so the page is never blank.
-}
viewMain : Model -> List (Html Msg)
viewMain model =
    case model.repos of
        Ready [] ->
            [ div [ class "empty" ]
                [ div [ class "dtitle" ] [ text "No repos yet" ]
                , div [] [ text "Press SPC p a and type the path of a repo that has a .beads folder." ]
                , div [ class "dim" ] [ text "Or start gebed with the paths: gebed ~/code/one ~/code/two" ]
                ]
            ]

        _ ->
            loaded model.beads (viewBody model)
