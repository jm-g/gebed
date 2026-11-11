module Main exposing (main)

import Board
import Browser
import Browser.Dom as Dom
import Browser.Events
import Calendar
import Html exposing (Html, div, li, span, text, textarea, ul)
import Html.Attributes as A exposing (class, classList)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as D
import Json.Encode as E
import Keys exposing (Action(..), ComposeKind(..), Dir(..), Outcome(..), View(..))
import Layout
import Nav
import Schedule
import Stats
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
    , selId : Maybe String
    , today : Int
    , drag : Maybe Drag
    , pending : List String
    , help : Bool
    , detail : Maybe Detail
    , compose : Maybe Composer
    , sessions : List Session
    , version : Maybe String
    , flash : Maybe String
    , edges : List Edge
    }


type alias Drag =
    { id : String
    , startX : Float
    , dx : Float
    , plan : Schedule.Plan
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
    | GotToday Int
    | Select String
    | DragStart String Float
    | DragMove Float
    | DragEnd
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
                  , view = KanbanView
                  , selId = Nothing
                  , today = 0
                  , drag = Nothing
                  , pending = []
                  , help = False
                  , detail = Nothing
                  , compose = Nothing
                  , sessions = []
                  , version = Nothing
                  , flash = Nothing
                  , edges = []
                  }
                , Cmd.batch [ getRepos, getThemes, getToday ]
                )
        , update = update
        , view = view
        , subscriptions =
            \model ->
                Sub.batch
                    ([ Browser.Events.onKeyDown keyDecoder
                     , Time.every 2000 Tick
                     ]
                        ++ (if model.drag /= Nothing then
                                [ Browser.Events.onMouseMove (D.map DragMove (D.field "pageX" D.float))
                                , Browser.Events.onMouseUp (D.succeed DragEnd)
                                ]

                            else
                                []
                           )
                    )
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


visible : Model -> List Bead
visible model =
    case model.beads of
        Ready bs ->
            Nav.order model.today model.view bs

        _ ->
            []


selected : Model -> Maybe Bead
selected model =
    let
        vs =
            visible model
    in
    case model.selId |> Maybe.andThen (\id -> List.filter (\b -> b.id == id) vs |> List.head) of
        Just b ->
            Just b

        Nothing ->
            List.head vs


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

        GotToday d ->
            ( { model | today = d }, Cmd.none )

        Select id ->
            ( { model | selId = Just id }, Cmd.none )

        DragStart id x ->
            case model.beads of
                Ready bs ->
                    case List.filter (\b -> b.id == id) bs |> List.head of
                        Just b ->
                            ( { model | selId = Just id, drag = Just { id = id, startX = x, dx = 0, plan = Schedule.plan model.today b } }, Cmd.none )

                        Nothing ->
                            ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        DragMove x ->
            ( { model | drag = Maybe.map (\d -> { d | dx = x - d.startX }) model.drag }, Cmd.none )

        DragEnd ->
            case ( model.drag, model.beads ) of
                ( Just d, Ready bs ) ->
                    let
                        moved =
                            round (d.dx / toFloat dayW)
                    in
                    case List.filter (\b -> b.id == d.id) bs |> List.head of
                        Just b ->
                            if moved == 0 then
                                ( { model | drag = Nothing }, Cmd.none )

                            else
                                schedule { model | drag = Nothing } b { due = d.plan.due + moved, days = d.plan.days }

                        Nothing ->
                            ( { model | drag = Nothing }, Cmd.none )

                _ ->
                    ( { model | drag = Nothing }, Cmd.none )

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
            ( { model | current = Just name, beads = Loading, selId = Nothing, detail = Nothing, version = Nothing }
            , getBeads name
            )

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

        GotBead id result ->
            ( withDetail id (\d -> { d | bead = toLoaded result }) model, Cmd.none )

        GotComments id result ->
            ( withDetail id (\d -> { d | comments = toLoaded result }) model, Cmd.none )

        Tick _ ->
            case model.current of
                Just name ->
                    ( model, Cmd.batch [ getVersion name, getToday ] )

                Nothing ->
                    ( model, getToday )

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
            ( { model | compose = Nothing, current = Just name, beads = Loading, selId = Nothing, detail = Nothing, version = Nothing, flash = Just ("added " ++ name) }
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
        Move dir ->
            case ( model.view, dir ) of
                ( WaterfallView, Left ) ->
                    ( model, scrollTimeline -7 )

                ( WaterfallView, Right ) ->
                    ( model, scrollTimeline 7 )

                _ ->
                    case model.beads of
                        Ready bs ->
                            ( { model | selId = Nav.step model.today model.view dir (Maybe.map .id (selected model)) bs }, Cmd.none )

                        _ ->
                            ( model, Cmd.none )

        Top ->
            ( { model | selId = visible model |> List.head |> Maybe.map .id }, Cmd.none )

        Bottom ->
            ( { model | selId = visible model |> List.reverse |> List.head |> Maybe.map .id }, Cmd.none )

        Push dx ->
            case ( model.view, target model ) of
                ( WaterfallView, Just b ) ->
                    schedule model b (Schedule.slide model.today dx b)

                ( _, Just b ) ->
                    pushStatus dx b model

                _ ->
                    ( model, Cmd.none )

        Bump dy ->
            case target model of
                Just b ->
                    let
                        p =
                            clampInt 0 4 (b.priority + dy)
                    in
                    if p == b.priority then
                        ( { model | flash = Just ("already P" ++ String.fromInt p) }, Cmd.none )

                    else
                        edit model (\_ -> [ ( "op", E.string "setPriority" ), ( "id", E.string b.id ), ( "priority", E.int p ) ])

                Nothing ->
                    ( model, Cmd.none )

        Stretch d ->
            case ( model.view, target model ) of
                ( WaterfallView, Just b ) ->
                    schedule model b (Schedule.stretch model.today d b)

                _ ->
                    ( { model | flash = Just "< and > resize a task on the waterfall (SPC v w)" }, Cmd.none )

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


{-| H and L: move the card to the neighbour column. Out of closed it reopens first, so the
card lands where it was sent.
-}
pushStatus : Int -> Bead -> Model -> ( Model, Cmd Msg )
pushStatus dx b model =
    let
        cols =
            case model.beads of
                Ready bs ->
                    Board.statusOrder bs

                _ ->
                    []

        labels =
            List.map statusLabel cols

        i =
            labels |> List.indexedMap Tuple.pair |> List.filter (\( _, l ) -> l == statusLabel b.status) |> List.head |> Maybe.map Tuple.first |> Maybe.withDefault 0

        j =
            clampInt 0 (List.length cols - 1) (i + dx)
    in
    case List.drop j cols |> List.head of
        Just s ->
            if j == i then
                ( { model
                    | flash =
                        Just
                            ("already in the "
                                ++ (if dx < 0 then
                                        "first"

                                    else
                                        "last"
                                   )
                                ++ " column"
                            )
                  }
                , Cmd.none
                )

            else if s == Types.Closed then
                edit model (\_ -> [ ( "op", E.string "close" ), ( "id", E.string b.id ) ])

            else
                edit model (\_ -> [ ( "op", E.string "setStatus" ), ( "id", E.string b.id ), ( "status", E.string (statusLabel s) ) ])

        Nothing ->
            ( model, Cmd.none )


{-| Plan a bead: show the new dates at once, then store them. The next refresh
confirms or corrects what the screen shows.
-}
schedule : Model -> Bead -> Schedule.Plan -> ( Model, Cmd Msg )
schedule model b p =
    case model.current of
        Just repo ->
            ( { model
                | beads =
                    mapBeads
                        (\x ->
                            if x.id == b.id then
                                { x | due = Calendar.toIso p.due, estDays = p.days }

                            else
                                x
                        )
                        model.beads
              }
            , postOp repo (scheduleFields p b)
            )

        Nothing ->
            ( model, Cmd.none )


mapBeads : (Bead -> Bead) -> Loaded (List Bead) -> Loaded (List Bead)
mapBeads f l =
    case l of
        Ready bs ->
            Ready (List.map f bs)

        other ->
            other


clampInt : Int -> Int -> Int -> Int
clampInt lo hi n =
    max lo (min hi n)


scheduleFields : Schedule.Plan -> Bead -> List ( String, E.Value )
scheduleFields p b =
    [ ( "op", E.string "setSchedule" ), ( "id", E.string b.id ), ( "due", E.string (Calendar.toIso p.due) ), ( "days", E.int p.days ) ]


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
    div (class "root" :: themeVars)
        [ viewBar model
        , div [ class "app" ]
            [ div [ class "sidebar" ] (loaded model.repos (viewRepos model.current))
            , div [ class "main" ] (viewMain model)
            , viewDetail model
            ]
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
            [ viewList sel beads ]

        KanbanView ->
            [ viewKanban sel beads ]

        GraphView ->
            [ viewGraph sel beads model.edges ]

        WaterfallView ->
            [ viewWaterfall model sel beads ]


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


dayW : Int
dayW =
    32


getToday : Cmd Msg
getToday =
    Task.map2
        (\zone now ->
            Calendar.fromYmd (Time.toYear zone now) (monthNumber (Time.toMonth zone now)) (Time.toDay zone now)
        )
        Time.here
        Time.now
        |> Task.perform GotToday


monthNumber : Time.Month -> Int
monthNumber m =
    case m of
        Time.Jan ->
            1

        Time.Feb ->
            2

        Time.Mar ->
            3

        Time.Apr ->
            4

        Time.May ->
            5

        Time.Jun ->
            6

        Time.Jul ->
            7

        Time.Aug ->
            8

        Time.Sep ->
            9

        Time.Oct ->
            10

        Time.Nov ->
            11

        Time.Dec ->
            12


scrollTimeline : Int -> Cmd Msg
scrollTimeline days =
    Dom.getViewportOf "wf"
        |> Task.andThen (\v -> Dom.setViewportOf "wf" (max 0 (v.viewport.x + toFloat (days * dayW))) v.viewport.y)
        |> Task.attempt (\_ -> NoOp)



-- STATUS BAR


viewBar : Model -> Html Msg
viewBar model =
    let
        beads =
            case model.beads of
                Ready bs ->
                    bs

                _ ->
                    []

        ( mode, modeClass ) =
            if model.compose /= Nothing then
                ( "-INSERT-", "insert" )

            else if model.drag /= Nothing then
                ( "-DRAG-", "drag" )

            else
                ( "-NORMAL-", "normal" )

        pending =
            model.pending
                |> List.map
                    (\k ->
                        if k == " " then
                            "SPC"

                        else
                            k
                    )
                |> String.join " "
    in
    div [ class "bar" ]
        [ span [ class ("mode " ++ modeClass) ] [ text mode ]
        , span [ class "pending" ] [ text pending ]
        , span [ class "vname" ] [ text (Keys.viewName model.view) ]
        , span [ class "stats" ] (List.map (\s -> span [ class "stat" ] [ text s ]) (Stats.summary model.today model.view beads model.edges))
        , span [ class "hints" ]
            (List.map
                (\( k, label ) -> span [ class "hint" ] [ span [ class "key" ] [ text k ], text (" " ++ label) ])
                (Keys.barHints model.view)
            )
        ]



-- BEADS: SHARED PIECES


statusClass : Types.Status -> String
statusClass s =
    case s of
        Types.Open ->
            "open"

        Types.InProgress ->
            "doing"

        Types.Blocked ->
            "blocked"

        Types.Closed ->
            "done"

        _ ->
            "other"


{-| Labels keep one color each: the same word always gets the same hue.
-}
labelChip : String -> Html Msg
labelChip l =
    span [ class ("chip lc" ++ String.fromInt (modBy 7 (List.sum (List.map Char.toCode (String.toList l))))) ] [ text l ]


prioBadge : Bead -> Html Msg
prioBadge b =
    span [ class ("prio p" ++ String.fromInt b.priority), A.title (prioName b.priority) ] [ text ("P" ++ String.fromInt b.priority) ]


prioName : Int -> String
prioName p =
    case p of
        0 ->
            "critical"

        1 ->
            "high"

        2 ->
            "medium"

        3 ->
            "low"

        _ ->
            "backlog"


dueText : Bead -> String
dueText b =
    if String.isEmpty b.due then
        ""

    else
        String.dropLeft 5 b.due



-- KANBAN


viewKanban : Maybe String -> List Bead -> Html Msg
viewKanban sel beads =
    div [ class "kanban" ] (List.map (column sel) (Board.columns beads))


column : Maybe String -> ( Types.Status, List Bead ) -> Html Msg
column sel ( status, beads ) =
    div [ class ("col st-" ++ statusClass status) ]
        [ div [ class "colhead" ]
            [ span [ class "colname" ] [ text (statusLabel status) ]
            , span [ class "colcount" ] [ text (String.fromInt (List.length beads)) ]
            ]
        , div [ class "cards" ]
            (if List.isEmpty beads then
                [ div [ class "colempty" ] [ text "nothing here — H and L move a card in" ] ]

             else
                List.map (card sel) beads
            )
        ]


card : Maybe String -> Bead -> Html Msg
card sel b =
    div [ classList [ ( "card", True ), ( "current", sel == Just b.id ) ], onClick (Select b.id) ]
        [ div [ class "cardtop" ]
            [ span [ class "id" ] [ text b.id ]
            , prioBadge b
            , span [ class "kind" ] [ text b.kind ]
            ]
        , div [ class "ctitle" ] [ text b.title ]
        , if List.isEmpty b.labels then
            text ""

          else
            div [ class "chips" ] (List.map labelChip b.labels)
        , div [ class "cardfoot" ]
            [ span []
                [ text
                    (if String.isEmpty b.assignee then
                        ""

                     else
                        "@" ++ b.assignee
                    )
                ]
            , span []
                [ text
                    (if String.isEmpty b.due then
                        ""

                     else
                        "due " ++ dueText b
                    )
                ]
            , span []
                [ text
                    (if b.depCount > 0 then
                        "⛓ " ++ String.fromInt b.depCount

                     else
                        ""
                    )
                ]
            ]
        ]



-- LIST


viewList : Maybe String -> List Bead -> Html Msg
viewList sel beads =
    div [ class "list" ]
        (div [ class "lrow lhead" ]
            [ span [] [ text "" ]
            , span [] [ text "ID" ]
            , span [] [ text "STATUS" ]
            , span [] [ text "TITLE" ]
            , span [] [ text "LABELS" ]
            , span [] [ text "OWNER" ]
            , span [] [ text "DUE" ]
            ]
            :: List.map (listRow sel) (Board.ordered beads)
        )


listRow : Maybe String -> Bead -> Html Msg
listRow sel b =
    div [ classList [ ( "lrow", True ), ( "current", sel == Just b.id ) ], onClick (Select b.id) ]
        [ prioBadge b
        , span [ class "id" ] [ text b.id ]
        , span [ class ("status st-" ++ statusClass b.status) ] [ text (statusLabel b.status) ]
        , span [ class "ltitle" ] [ text b.title, span [ class "kind" ] [ text ("  " ++ b.kind) ] ]
        , span [ class "chips" ] (List.map labelChip b.labels)
        , span [ class "dim" ]
            [ text
                (if String.isEmpty b.assignee then
                    "—"

                 else
                    "@" ++ b.assignee
                )
            ]
        , span [ class "dim" ]
            [ text
                (if String.isEmpty b.due then
                    "—"

                 else
                    dueText b
                )
            ]
        ]



-- WATERFALL


viewWaterfall : Model -> Maybe String -> List Bead -> Html Msg
viewWaterfall model sel beads =
    let
        ss =
            Schedule.spans model.today beads

        ( from, to ) =
            Schedule.window model.today ss

        total =
            (to - from + 1) * dayW

        px d =
            (d - from) * dayW

        days =
            List.range from to

        cell d =
            span
                [ classList [ ( "wd", True ), ( "wend", Calendar.weekend d ), ( "wnow", d == model.today ) ] ]
                [ text (String.fromInt (Calendar.dayOfMonth d)) ]

        monthCell d =
            span [ class "wm" ]
                [ text
                    (if d == from || Calendar.dayOfMonth d == 1 then
                        let
                            c =
                                Calendar.civil d
                        in
                        Calendar.monthName c.month ++ " " ++ String.fromInt c.year

                     else
                        ""
                    )
                ]

        shift s =
            case model.drag of
                Just d ->
                    if d.id == s.bead.id then
                        round (d.dx / toFloat dayW)

                    else
                        0

                Nothing ->
                    0

        bar s =
            let
                late =
                    s.scheduled && s.end < model.today && s.bead.status /= Types.Closed

                left =
                    px (s.start + shift s)
            in
            div
                [ classList
                    [ ( "wbar", True )
                    , ( "wbar-" ++ statusClass s.bead.status, True )
                    , ( "unsched", not s.scheduled )
                    , ( "late", late )
                    , ( "current", sel == Just s.bead.id )
                    , ( "dragging", shift s /= 0 )
                    ]
                , A.style "left" (String.fromInt left ++ "px")
                , A.style "width" (String.fromInt ((s.end - s.start + 1) * dayW - 2) ++ "px")
                , A.title
                    (if s.scheduled then
                        Calendar.toIso (s.start + shift s) ++ " → " ++ Calendar.toIso (s.end + shift s)

                     else
                        "not scheduled yet: move it with H and L, or drag it"
                    )
                , Html.Events.preventDefaultOn "mousedown"
                    (D.map (\x -> ( DragStart s.bead.id x, True )) (D.field "pageX" D.float))
                ]
                [ text s.bead.title ]

        row s =
            div [ classList [ ( "wrow", True ), ( "current", sel == Just s.bead.id ) ] ]
                [ span [ class "wlabel", onClick (Select s.bead.id) ]
                    [ span [ class "id" ] [ text s.bead.id ], text (" " ++ s.bead.title) ]
                , div [ class "wtrack", A.style "width" (String.fromInt total ++ "px") ]
                    [ div [ class "wtoday", A.style "left" (String.fromInt (px model.today + dayW // 2) ++ "px") ] []
                    , bar s
                    ]
                ]
    in
    div [ class "wf", A.id "wf" ]
        (div [ class "wrow wruler" ]
            [ span [ class "wlabel" ] [ text "" ]
            , div [ class "wtrack", A.style "width" (String.fromInt total ++ "px") ]
                [ div [ class "wmonths" ] (List.map monthCell days)
                , div [ class "wdays" ] (List.map cell days)
                ]
            ]
            :: List.map row ss
        )
