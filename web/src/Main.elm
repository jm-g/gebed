port module Main exposing (main)

import Agile
import Board
import Browser
import Browser.Dom as Dom
import Browser.Events
import Calendar
import Charts
import Html exposing (Html, div, li, node, span, text, textarea, ul)
import Html.Attributes as A exposing (class, classList)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as D
import Json.Encode as E
import Keys exposing (Action(..), ComposeKind(..), Dir(..), Outcome(..), View(..))
import Layout
import Metrics exposing (Metrics)
import Nav
import Schedule
import Scroll exposing (Place(..))
import Stats
import Svg
import Svg.Attributes as SA
import Task
import Theme
import Time
import Timeline
import Types exposing (Bead, Comment, Delivery, Edge, Hit, Repo, Session, statusLabel)
import Url
import Widgets exposing (chips, dueText, prioBadge, statusClass)


{-| Asks the page to open a link in a new tab. The page only follows the sponsor
link, so no other text can make it open anything.
-}
port openUrl : String -> Cmd msg


sponsorUrl : String
sponsorUrl =
    "https://github.com/sponsors/vic"


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
    , picker : Maybe ThemePicker
    , view : View
    , selId : Maybe String
    , today : Int
    , drag : Maybe Drag
    , zoom : Int
    , offset : Int
    , nowMin : Int
    , focusMin : Maybe Int
    , finder : Maybe Finder
    , allKeys : Bool
    , focus : Maybe String
    , pending : List String
    , help : Bool
    , detail : Maybe Detail
    , compose : Maybe Composer
    , sessions : List Session
    , version : Maybe String
    , flash : Maybe String
    , metrics : Maybe Metrics
    , edges : List Edge
    }


type alias Finder =
    { fuzzy : Bool
    , query : String
    , hits : List Hit
    , sel : Int
    , note : String
    }


{-| orig is the theme index to restore when the picker is cancelled.
-}
type alias ThemePicker =
    { query : String
    , sel : Int
    , orig : Int
    }


type alias Drag =
    { id : String
    , startX : Float
    , dx : Float
    , plan : Timeline.Plan
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
    | RepoRemoved String (Result Http.Error ())
    | Pick String
    | Key String
    | Tick Time.Posix
    | Draft String
    | Submit
    | CancelCompose
    | Mention String
    | MentionNext
    | GotClock Int Int Int
    | GoView View
    | GotMetrics String (Result Http.Error Metrics)
    | ZoomBy Int
    | Select String
    | DragStart String Float
    | DragMove Float
    | DragEnd
    | FinderInput String
    | GotHits String Bool (Result Http.Error (List Hit))
    | FinderMove Int
    | FinderOpen
    | FinderClose
    | ThemeInput String
    | ThemeMove Int
    | ThemeConfirm
    | ThemeCancel
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
                  , picker = Nothing
                  , view = KanbanView
                  , selId = Nothing
                  , today = 0
                  , drag = Nothing
                  , zoom = Timeline.defaultZoom
                  , offset = 0
                  , nowMin = 0
                  , focusMin = Nothing
                  , finder = Nothing
                  , allKeys = False
                  , focus = Nothing
                  , pending = []
                  , help = False
                  , detail = Nothing
                  , compose = Nothing
                  , sessions = []
                  , version = Nothing
                  , flash = Nothing
                  , metrics = Nothing
                  , edges = []
                  }
                , Cmd.batch [ getRepos, getThemes, getClock ]
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
            if c || a || m || tag == "TEXTAREA" || tag == "INPUT" then
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


composerKeys : D.Decoder ( Msg, Bool )
composerKeys =
    D.map2 Tuple.pair (D.field "key" D.string) (D.field "ctrlKey" D.bool)
        |> D.andThen
            (\( k, ctrl ) ->
                if k == "Escape" then
                    D.succeed ( CancelCompose, True )

                else if k == "Enter" && ctrl then
                    D.succeed ( Submit, True )

                else if k == "Tab" then
                    -- Tab inserts the next live session as an , and keeps focus here
                    D.succeed ( MentionNext, True )

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


deleteRepo : String -> Cmd Msg
deleteRepo name =
    Http.request
        { method = "DELETE"
        , headers = []
        , url = "/api/repos/" ++ Url.percentEncode name
        , body = Http.emptyBody
        , expect = Http.expectWhatever (RepoRemoved name)
        , timeout = Nothing
        , tracker = Nothing
        }


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
                    ++ (if model.view == MetricsView then
                            [ getMetrics name ]

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

        FinderInput q ->
            case model.finder of
                Just f ->
                    ( { model | finder = Just { f | query = q, sel = 0, note = "searching…" } }
                    , if String.isEmpty (String.trim q) then
                        Cmd.none

                      else
                        getHits q f.fuzzy
                    )

                Nothing ->
                    ( model, Cmd.none )

        GotHits q fuzzy result ->
            case model.finder of
                Just f ->
                    -- an answer for an older query is dropped
                    if f.query /= q || f.fuzzy /= fuzzy then
                        ( model, Cmd.none )

                    else
                        case result of
                            Ok hs ->
                                ( { model | finder = Just { f | hits = hs, note = "nothing found" } }, Cmd.none )

                            Err e ->
                                ( { model | finder = Just { f | hits = [], note = "search failed: " ++ httpError e } }, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

        FinderMove d ->
            ( { model | finder = Maybe.map (\f -> { f | sel = clampInt 0 (List.length f.hits - 1) (f.sel + d) }) model.finder }, Cmd.none )

        FinderClose ->
            ( { model | finder = Nothing }, Cmd.none )

        FinderOpen ->
            case model.finder |> Maybe.andThen (\f -> List.drop f.sel f.hits |> List.head) of
                Just h ->
                    openHit h { model | finder = Nothing }

                Nothing ->
                    ( { model | finder = Nothing }, Cmd.none )

        ThemeInput q ->
            ( previewTheme 0 { model | picker = Maybe.map (\p -> { p | query = q }) model.picker }, Cmd.none )

        ThemeMove d ->
            ( previewTheme (Maybe.withDefault 0 (Maybe.map (\p -> p.sel + d) model.picker)) model, Cmd.none )

        ThemeConfirm ->
            ( { model | picker = Nothing }, Cmd.none )

        ThemeCancel ->
            ( { model | picker = Nothing, themeIdx = Maybe.withDefault model.themeIdx (Maybe.map .orig model.picker) }, Cmd.none )

        GotClock d off now ->
            ( { model | today = d, offset = off, nowMin = now }, Cmd.none )

        GoView v ->
            run (Show v) model

        GotMetrics name result ->
            if model.current /= Just name then
                ( model, Cmd.none )

            else
                case result of
                    Ok m ->
                        ( { model | metrics = Just m }, Cmd.none )

                    Err e ->
                        ( { model | flash = Just ("metrics: " ++ httpError e) }, Cmd.none )

        ZoomBy d ->
            zoomBy d model

        Select id ->
            ( { model | selId = Just id }, Cmd.none )

        DragStart id x ->
            case model.beads of
                Ready bs ->
                    case List.filter (\b -> b.id == id) bs |> List.head of
                        Just b ->
                            ( { model | selId = Just id, drag = Just { id = id, startX = x, dx = 0, plan = Timeline.plan (clockOf model) b } }, Cmd.none )

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
                            round (d.dx / toFloat cellW) * cellMinutes model
                    in
                    case List.filter (\b -> b.id == d.id) bs |> List.head of
                        Just b ->
                            if moved == 0 then
                                ( { model | drag = Nothing }, Cmd.none )

                            else
                                scheduleExact { model | drag = Nothing } b { end = d.plan.end + moved, minutes = d.plan.minutes }

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
            ( { model | themes = ts, themeIdx = Theme.defaultIndex ts }, Cmd.none )

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
            ( { model | current = Just name, beads = Loading, metrics = Nothing, selId = Nothing, detail = Nothing, version = Nothing }
            , getBeads name
            )

        GotBeads name result ->
            if model.current /= Just name then
                -- a slower reply for a repo we left
                ( model, Cmd.none )

            else
                case result of
                    Ok bs ->
                        case model.focus of
                            Just id ->
                                openDetail id { model | beads = Ready bs, focus = Nothing }

                            Nothing ->
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
                    ( model, Cmd.batch [ getVersion name, getClock ] )

                Nothing ->
                    ( model, getClock )

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
            if model.allKeys then
                -- the list of all keys is open: Esc or q closes it, other keys do nothing
                ( if k == "Escape" || k == "q" || k == "Backspace" then
                    { model | allKeys = False }

                  else
                    model
                , Cmd.none
                )

            else
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

        MentionNext ->
            case model.sessions of
                [] ->
                    ( model, Cmd.none )

                ss ->
                    let
                        used =
                            model.compose |> Maybe.map (\c -> List.length (String.indices "@" c.text)) |> Maybe.withDefault 0
                    in
                    case List.drop (modBy (List.length ss) used) ss |> List.head of
                        Just s ->
                            update (Mention s.nick) model

                        Nothing ->
                            ( model, Cmd.none )

        CancelCompose ->
            ( { model | compose = Nothing }, Cmd.none )

        Submit ->
            case ( model.compose, model.current ) of
                ( Just { kind, text }, _ ) ->
                    if kind == AddRepo then
                        ( model, postRepo text )

                    else if kind == RemoveRepo then
                        ( model, deleteRepo (String.trim text) )

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

        RepoRemoved name (Ok ()) ->
            ( { model | compose = Nothing, flash = Just ("removed " ++ name ++ " (its folder stays on disk)") }, getRepos )

        RepoRemoved name (Err e) ->
            ( { model | flash = Just ("not removed " ++ name ++ ": " ++ httpError e) }, Cmd.none )

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

        SetEpic ->
            [ ( "op", E.string "addDep" ), ( "from", E.string c.target ), ( "on", E.string (String.trim c.text) ), ( "type", E.string "parent-child" ) ]

        ClearEpic ->
            [ ( "op", E.string "removeDep" ), ( "from", E.string c.target ), ( "on", E.string (String.trim c.text) ) ]

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
                            let
                                next =
                                    { model | selId = Nav.step model.today model.view dir (Maybe.map .id (selected model)) bs }
                            in
                            case ( model.detail, next.selId ) of
                                ( Just _, Just id ) ->
                                    -- an open discussion follows the selection
                                    openDetail id next

                                _ ->
                                    ( next, reveal next.view )

                        _ ->
                            ( model, Cmd.none )

        Top ->
            ( { model | selId = visible model |> List.head |> Maybe.map .id }, reveal model.view )

        Bottom ->
            ( { model | selId = visible model |> List.reverse |> List.head |> Maybe.map .id }, reveal model.view )

        Push dx ->
            case ( model.view, target model ) of
                ( WaterfallView, Just b ) ->
                    scheduleExact model b (Timeline.slide (cellMinutes model) dx (clockOf model) b)

                ( IterationsView, Just b ) ->
                    schedule model b (Schedule.slide model.today (7 * dx) b)

                ( MatrixView, Just b ) ->
                    schedule model b (Schedule.stretch model.today dx b)

                ( RoadmapView, Just b ) ->
                    pushLane dx b model

                ( StoryMapView, Just _ ) ->
                    ( { model | flash = Just "the epic is a tag: SPC e e adds it, SPC e x removes it" }, Cmd.none )

                ( EpicsView, Just _ ) ->
                    ( { model | flash = Just "the epic is a tag: SPC e e adds it, SPC e x removes it" }, Cmd.none )

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
                ( MatrixView, Just b ) ->
                    schedule model b (Schedule.stretch model.today d b)

                ( WaterfallView, Just b ) ->
                    scheduleExact model b (Timeline.stretch (cellMinutes model) d (clockOf model) b)

                _ ->
                    ( { model | flash = Just "< and > resize a task on the waterfall (SPC v w)" }, Cmd.none )

        Find fuzzy ->
            ( { model | finder = Just { fuzzy = fuzzy, query = "", hits = [], sel = 0, note = "" }, pending = [] }, focusFinder )

        RepoStep d ->
            stepRepo d model

        ViewStep d ->
            run (Show (stepView d model.view)) model

        Section d ->
            moveTo (Nav.section d (Maybe.map .id (selected model)) (sectionsOf model)) model

        SectionEdge d ->
            moveTo (Nav.edge d (Maybe.map .id (selected model)) (sectionsOf model)) model

        Align place ->
            ( model
            , Cmd.batch
                [ alignSelection model.view place
                , if model.view == WaterfallView then
                    focusScroll model

                  else
                    Cmd.none
                ]
            )

        Zoom d ->
            zoomBy d model

        ZoomReset ->
            zoomBy (0 - model.zoom) model

        ShowAllKeys ->
            ( { model | allKeys = True, pending = [] }, Cmd.none )

        Sponsor ->
            ( model, openUrl sponsorUrl )

        Scroll dir ->
            ( model
            , scrollPane
                (if model.detail /= Nothing then
                    "detail"

                 else
                    "main"
                )
                dir
            )

        Show v ->
            ( { model | view = v }
            , Cmd.batch
                [ case ( v, model.current ) of
                    ( GraphView, Just name ) ->
                        getEdges name

                    ( MetricsView, Just name ) ->
                        getMetrics name

                    _ ->
                        Cmd.none
                , reveal v
                ]
            )

        PickTheme ->
            ( { model | picker = Just { query = "", sel = 0, orig = model.themeIdx }, pending = [] }, focusThemePicker )

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

        Compose RemoveRepo ->
            ( { model | compose = Just { kind = RemoveRepo, target = "", text = "" } }, focusComposer )

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


{-| H and L on the roadmap: Now is in progress, Next is open, Later is deferred.
-}
pushLane : Int -> Bead -> Model -> ( Model, Cmd Msg )
pushLane dx b model =
    let
        cols =
            case model.beads of
                Ready bs ->
                    Agile.roadmapCols model.today bs

                _ ->
                    []

        here =
            cols |> List.indexedMap Tuple.pair |> List.filter (\( _, c ) -> List.any (\x -> x.id == b.id) c.beads) |> List.head |> Maybe.map Tuple.first |> Maybe.withDefault 0

        to =
            clampInt 0 2 (here + dx)
    in
    if to == here then
        ( { model | flash = Just "already in the last lane" }, Cmd.none )

    else
        edit model (\_ -> [ ( "op", E.string "setStatus" ), ( "id", E.string b.id ), ( "status", E.string (List.drop to [ "in_progress", "open", "deferred" ] |> List.head |> Maybe.withDefault "open") ) ])


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
        themeCss =
            model.themes
                |> List.drop model.themeIdx
                |> List.head
                |> Maybe.map Theme.css
                |> Maybe.withDefault ""
    in
    div [ class "root" ]
        [ node "style" [] [ text themeCss ]
        , viewBar model
        , viewTabs model
        , div [ class "app" ]
            [ div [ class "sidebar" ] (loaded model.repos (viewRepos model.current))
            , div [ class "main", A.id "main" ] (viewMain model)
            , viewDetail model
            ]
        , viewFlash model
        , viewPopup model
        , viewFinder model
        , viewThemePicker model
        , viewAllKeys model
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

        GraphView ->
            [ viewGraph sel beads model.edges ]

        WaterfallView ->
            [ viewWaterfall model sel beads ]

        MetricsView ->
            [ Charts.viewMetrics model.metrics ]

        EpicsView ->
            [ Charts.viewEpics Select sel (Agile.epicGroups beads) ]

        FlowView ->
            [ Charts.viewFlow (Agile.flow model.today beads) ]

        MatrixView ->
            [ Charts.viewMatrix Select sel beads ]

        _ ->
            case Agile.columnsFor model.today model.view beads of
                Just cols ->
                    [ Charts.viewBoard Select sel cols ]

                Nothing ->
                    []


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
            div [ class "detail", A.id "detail" ]
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
    , if List.isEmpty b.epics then
        text ""

      else
        div [ class "dmeta" ] [ chips b ]
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
                    "add repos: one per line, path or name:path (name defaults to the folder name); ~ is home"

                RemoveRepo ->
                    "remove a repo: type its name (the folder stays on disk)"

                SetEpic ->
                    "put " ++ c.target ++ " in an epic: type the epic id"

                ClearEpic ->
                    "take " ++ c.target ++ " out of an epic: type the epic id"

                Link ->
                    c.target ++ " depends on … (bead id, or repo:id for another repo)"

                AddLabel ->
                    "add a label to " ++ c.target

                RemoveLabel ->
                    "remove a label from " ++ c.target
    in
    div [ class "composer" ]
        [ div [ class "dim" ] [ text (label ++ "   (Ctrl+Enter send, Tab mention a session, Esc cancel)") ]
        , textarea
            [ A.id "composer"
            , A.value c.text
            , A.rows 4
            , onInput Draft
            , Html.Events.preventDefaultOn "keydown" composerKeys
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


cellW : Int
cellW =
    40


{-| The zone offset and now, in the local minutes the timeline works in.
-}
getClock : Cmd Msg
getClock =
    Task.map2
        (\zone now ->
            let
                utc =
                    Time.posixToMillis now // 60000

                off0 =
                    Time.toHour zone now * 60 + Time.toMinute zone now - modBy 1440 utc

                off =
                    if off0 > 720 then
                        off0 - 1440

                    else if off0 < -720 then
                        off0 + 1440

                    else
                        off0
            in
            { day = (utc + off) // 1440, offset = off, now = utc + off }
        )
        Time.here
        Time.now
        |> Task.perform (\c -> GotClock c.day c.offset c.now)


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
        |> Task.andThen (\v -> Dom.setViewportOf "wf" (max 0 (v.viewport.x + toFloat (days * cellW))) v.viewport.y)
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
            if model.finder /= Nothing then
                ( "-FIND-", "insert" )

            else if model.picker /= Nothing then
                ( "-THEME-", "insert" )

            else if model.compose /= Nothing then
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
        , span [ class "vname" ]
            [ text
                (if model.view == WaterfallView then
                    "zoom " ++ (Timeline.zoomAt model.zoom).name

                 else
                    ""
                )
            ]
        , span [ class "hints" ]
            (List.map
                (\( k, label ) -> span [ class "hint" ] [ span [ class "key" ] [ text k ], text (" " ++ label) ])
                (Keys.barHints model.view)
            )
        , Html.a [ class "sponsor", A.href sponsorUrl, A.target "_blank", A.rel "noopener noreferrer" ] [ text "Sponsor <3" ]
        ]



-- BEADS: SHARED PIECES
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
    div (selMark sel b.id ++ [ classList [ ( "lrow", True ), ( "current", sel == Just b.id ) ], onClick (Select b.id) ])
        [ prioBadge b
        , span [ class "id" ] [ text b.id ]
        , span [ class ("status st-" ++ statusClass b.status) ] [ text (statusLabel b.status) ]
        , span [ class "ltitle" ] [ text b.title, span [ class "kind" ] [ text ("  " ++ b.kind) ] ]
        , chips b
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
        zoom =
            Timeline.zoomAt model.zoom

        cell =
            zoom.cell

        c =
            clockOf model

        ss =
            Timeline.spans c beads

        ( from, to ) =
            Timeline.window cell (Maybe.withDefault model.nowMin model.focusMin) c ss

        n =
            (to - from) // cell + 1

        total =
            n * cellW

        px m =
            (m - from) * cellW // cell

        starts =
            List.range 0 (n - 1) |> List.map (\i -> from + i * cell)

        cellNode i start =
            span
                [ classList
                    [ ( "wd", True )
                    , ( "wend", cell >= 1440 && Calendar.weekend (start // 1440) )
                    , ( "wnow", start <= model.nowMin && model.nowMin < start + cell )
                    , ( "wmid", cell < 1440 && modBy 1440 start == 0 )
                    ]
                ]
                [ text (Timeline.cellLabel cell start) ]

        monthNode i start =
            span [ class "wm" ] [ text (Timeline.topLabel cell start (i == 0)) ]

        shift s =
            case model.drag of
                Just d ->
                    if d.id == s.bead.id then
                        round (d.dx / toFloat cellW) * cell

                    else
                        0

                Nothing ->
                    0

        bar s =
            let
                late =
                    s.scheduled && s.end < model.nowMin && s.bead.status /= Types.Closed

                moved =
                    shift s

                width =
                    if s.scheduled then
                        max 8 ((s.end - s.start) * cellW // cell - 2)

                    else
                        cellW - 2
            in
            div
                [ classList
                    [ ( "wbar", True )
                    , ( "wbar-" ++ statusClass s.bead.status, True )
                    , ( "unsched", not s.scheduled )
                    , ( "late", late )
                    , ( "current", sel == Just s.bead.id )
                    , ( "dragging", moved /= 0 )
                    ]
                , A.style "left" (String.fromInt (px (s.start + moved)) ++ "px")
                , A.style "width" (String.fromInt width ++ "px")
                , A.title
                    (if s.scheduled then
                        Timeline.stamp (s.start + moved) ++ " → " ++ Timeline.stamp (s.end + moved)

                     else
                        "not scheduled yet: move it with H and L, or drag it"
                    )
                , Html.Events.preventDefaultOn "mousedown"
                    (D.map (\x -> ( DragStart s.bead.id x, True )) (D.field "pageX" D.float))
                ]
                [ text s.bead.title ]

        inWindow s =
            s.end + cell >= from && s.start <= to + cell

        row s =
            div (selMark sel s.bead.id ++ [ classList [ ( "wrow", True ), ( "current", sel == Just s.bead.id ) ] ])
                [ span [ class "wlabel", onClick (Select s.bead.id) ]
                    [ span [ class "id" ] [ text s.bead.id ], text (" " ++ s.bead.title) ]
                , div [ class "wtrack", A.style "width" (String.fromInt total ++ "px") ]
                    [ if model.nowMin >= from && model.nowMin <= to then
                        div [ class "wtoday", A.style "left" (String.fromInt (px model.nowMin) ++ "px") ] []

                      else
                        text ""
                    , if inWindow s then
                        bar s

                      else
                        text ""
                    ]
                ]
    in
    div [ class "wf", A.id "wf", A.style "--cw" (String.fromInt cellW ++ "px") ]
        (div [ class "wrow wruler" ]
            [ span [ class "wlabel" ]
                [ span [ class "zoomctl" ]
                    [ span [ class "zbtn", onClick (ZoomBy -1) ] [ text "−" ]
                    , text (" zoom: " ++ zoom.name ++ " ")
                    , span [ class "zbtn", onClick (ZoomBy 1) ] [ text "+" ]
                    ]
                ]
            , div [ class "wtrack", A.style "width" (String.fromInt total ++ "px") ]
                [ div [ class "wmonths" ] (List.indexedMap monthNode starts)
                , div [ class "wdays" ] (List.indexedMap cellNode starts)
                ]
            ]
            :: List.map row ss
        )


clockOf : Model -> Timeline.Clock
clockOf model =
    { offset = model.offset, now = model.nowMin }


cellMinutes : Model -> Int
cellMinutes model =
    (Timeline.zoomAt model.zoom).cell


{-| Plan a task to the minute: show the new times at once, then store them.
-}
scheduleExact : Model -> Bead -> Timeline.Plan -> ( Model, Cmd Msg )
scheduleExact model b p =
    case model.current of
        Just repo ->
            ( { model
                | beads =
                    mapBeads
                        (\x ->
                            if x.id == b.id then
                                { x
                                    | dueMs = Just ((p.end - model.offset) * 60000)
                                    , estMin = p.minutes
                                    , due = Calendar.toIso (p.end // 1440)
                                    , estDays = max 1 ((p.minutes + 1439) // 1440)
                                }

                            else
                                x
                        )
                        model.beads
              }
            , postOp repo
                [ ( "op", E.string "setSchedule" )
                , ( "id", E.string b.id )
                , ( "due", E.string (Timeline.isoUtc model.offset p.end) )
                , ( "minutes", E.int p.minutes )
                ]
            )

        Nothing ->
            ( model, Cmd.none )


{-|

  - and -: a finer or coarser timeline, centered on the selected task (or now).

-}
zoomBy : Int -> Model -> ( Model, Cmd Msg )
zoomBy d model =
    if model.view /= WaterfallView then
        ( { model | flash = Just "zoom works on the waterfall: SPC v w" }, Cmd.none )

    else
        let
            z =
                clampInt 0 (List.length Timeline.zooms - 1) (model.zoom + d)

            focus =
                case selected model of
                    Just b ->
                        (Timeline.plan (clockOf model) b).end

                    Nothing ->
                        model.nowMin

            next =
                { model | zoom = z, focusMin = Just focus, flash = Just ("timeline zoom: " ++ (Timeline.zoomAt z).name) }
        in
        ( next, focusScroll next )


{-| Scroll the timeline so the focus time sits a little right of the labels.
-}
focusScroll : Model -> Cmd Msg
focusScroll model =
    case model.beads of
        Ready bs ->
            let
                cell =
                    cellMinutes model

                focus =
                    Maybe.withDefault model.nowMin model.focusMin

                ( from, _ ) =
                    Timeline.window cell focus (clockOf model) (Timeline.spans (clockOf model) bs)

                x =
                    260 + (focus - from) * cellW // cell - 320
            in
            Dom.getViewportOf "wf"
                |> Task.andThen (\v -> Dom.setViewportOf "wf" (toFloat (max 0 x)) v.viewport.y)
                |> Task.attempt (\_ -> NoOp)

        _ ->
            Cmd.none


sectionsOf : Model -> List (List Bead)
sectionsOf model =
    case model.beads of
        Ready bs ->
            Nav.sections model.today model.view bs

        _ ->
            []


{-| Select a bead from a motion like [[ or }: the open discussion follows it,
and the view scrolls to show it.
-}
moveTo : Maybe String -> Model -> ( Model, Cmd Msg )
moveTo target_ model =
    case target_ of
        Just id ->
            let
                next =
                    { model | selId = Just id }
            in
            if model.detail /= Nothing then
                openDetail id next

            else
                ( next, reveal next.view )

        Nothing ->
            ( model, Cmd.none )


{-| zt, zz and zb: put the selected card or row at the top, middle or bottom.
-}
alignSelection : View -> Place -> Cmd Msg
alignSelection which place =
    let
        ( container, pad ) =
            case which of
                WaterfallView ->
                    ( "wf", 46 )

                _ ->
                    ( "main", 0 )
    in
    Task.map3 (\v box el -> ( v, box, el ))
        (Dom.getViewportOf container)
        (Dom.getElement container)
        (Dom.getElement "sel")
        |> Task.andThen
            (\( v, box, el ) ->
                Dom.setViewportOf container v.viewport.x (Scroll.align place pad (el.element.y - box.element.y + v.viewport.y) el.element.height v.viewport.height)
            )
        |> Task.attempt (\_ -> NoOp)


{-| The second top bar: every view as a tab with its count; the current one is
highlighted and opens up into its own numbers.
-}
viewTabs : Model -> Html Msg
viewTabs model =
    let
        beads =
            case model.beads of
                Ready bs ->
                    bs

                _ ->
                    []

        tab v =
            if v == model.view then
                div [ class "tab current", onClick (GoView v) ]
                    (span [ class "tabname" ] [ text (Keys.viewName v) ]
                        :: List.map (\s -> span [ class "stat" ] [ text s ]) (Stats.summary model.today (clockOf model) v beads model.edges)
                    )

            else
                div [ class "tab", onClick (GoView v) ]
                    [ span [ class "tabname" ] [ text (Keys.viewName v) ]
                    , span [ class "tabcount" ] [ text (Stats.tab model.today (clockOf model) v beads model.edges) ]
                    ]
    in
    div [ class "tabs" ] (List.map tab viewOrder)


{-| The selected card or row carries this id, so `reveal` can find it.
-}
selMark : Maybe String -> String -> List (Html.Attribute Msg)
selMark sel id =
    if sel == Just id then
        [ A.id "sel" ]

    else
        []


{-| Scroll the pane just enough to show the selected card or row. The waterfall
scrolls in its own box, under a sticky ruler of 46px, and only vertically.
-}
reveal : View -> Cmd Msg
reveal which =
    let
        ( container, pad ) =
            case which of
                WaterfallView ->
                    ( "wf", 46 )

                _ ->
                    ( "main", 0 )
    in
    Task.map3 (\v box el -> ( v, box, el ))
        (Dom.getViewportOf container)
        (Dom.getElement container)
        (Dom.getElement "sel")
        |> Task.andThen
            (\( v, box, el ) ->
                let
                    -- where the element sits inside the scrolled content
                    y =
                        el.element.y - box.element.y + v.viewport.y

                    x =
                        el.element.x - box.element.x + v.viewport.x
                in
                Dom.setViewportOf container
                    (if which == WaterfallView then
                        v.viewport.x

                     else
                        Scroll.into v.viewport.x 0 x el.element.width v.viewport.width 16
                    )
                    (Scroll.into v.viewport.y pad y el.element.height v.viewport.height 16)
            )
        |> Task.attempt (\_ -> NoOp)



-- FINDER


getHits : String -> Bool -> Cmd Msg
getHits query fuzzy =
    Http.get
        { url =
            "/api/search?mode="
                ++ (if fuzzy then
                        "fuzzy"

                    else
                        "exact"
                   )
                ++ "&q="
                ++ Url.percentEncode query
        , expect = Http.expectJson (GotHits query fuzzy) (D.field "hits" (D.list Types.hitDecoder))
        }


finderKeys : D.Decoder Msg
finderKeys =
    D.map2 Tuple.pair (D.field "key" D.string) (D.field "ctrlKey" D.bool)
        |> D.andThen
            (\( k, ctrl ) ->
                case ( k, ctrl ) of
                    ( "Escape", _ ) ->
                        D.succeed FinderClose

                    ( "Enter", _ ) ->
                        D.succeed FinderOpen

                    ( "ArrowDown", _ ) ->
                        D.succeed (FinderMove 1)

                    ( "ArrowUp", _ ) ->
                        D.succeed (FinderMove -1)

                    ( "n", True ) ->
                        D.succeed (FinderMove 1)

                    ( "p", True ) ->
                        D.succeed (FinderMove -1)

                    _ ->
                        D.fail "typing"
            )


viewFinder : Model -> Html Msg
viewFinder model =
    case model.finder of
        Nothing ->
            text ""

        Just f ->
            let
                multi =
                    case model.repos of
                        Ready rs ->
                            List.length rs > 1

                        _ ->
                            False

                row i h =
                    div [ classList [ ( "hit", True ), ( "current", i == f.sel ) ], onClick (Select h.id) ]
                        [ span [ class "hitid" ]
                            [ text
                                ((if multi then
                                    h.repo ++ " "

                                  else
                                    ""
                                 )
                                    ++ h.id
                                )
                            ]
                        , span [ class "hittitle" ] [ text h.title ]
                        , span [ class "hitfield" ] [ text h.field ]
                        , span [ class "hitsnip dim" ] [ text h.snippet ]
                        ]
            in
            div [ class "finder" ]
                [ div [ class "finderbox" ]
                    [ div [ class "findhead" ]
                        [ span [ class "findmode" ]
                            [ text
                                (if f.fuzzy then
                                    "FIND (fuzzy)"

                                 else
                                    "SEARCH (exact)"
                                )
                            ]
                        , span [ class "dim" ] [ text "id, title, text, comments, labels, epics, dates" ]
                        ]
                    , Html.input
                        [ A.id "finder"
                        , A.value f.query
                        , A.placeholder "type to search"
                        , A.autocomplete False
                        , onInput FinderInput
                        , Html.Events.on "keydown" finderKeys
                        ]
                        []
                    , div [ class "hits" ]
                        (if List.isEmpty f.hits then
                            [ div [ class "dim hitnone" ]
                                [ text
                                    (if String.isEmpty (String.trim f.query) then
                                        "start typing"

                                     else
                                        f.note
                                    )
                                ]
                            ]

                         else
                            List.indexedMap row f.hits
                        )
                    , div [ class "dim findfoot" ] [ text "↑ ↓ or Ctrl+p Ctrl+n move · Enter open · Esc close" ]
                    ]
                ]


{-| Selects the sel-th match as the live theme. With no match the theme goes back
to the one the picker opened with.
-}
previewTheme : Int -> Model -> Model
previewTheme sel model =
    case model.picker of
        Just p ->
            let
                hits =
                    Theme.search p.query model.themes

                s =
                    clampInt 0 (max 0 (List.length hits - 1)) sel
            in
            { model | picker = Just { p | sel = s }, themeIdx = List.drop s hits |> List.head |> Maybe.withDefault p.orig }

        Nothing ->
            model


themeKeys : D.Decoder Msg
themeKeys =
    D.map2 Tuple.pair (D.field "key" D.string) (D.field "ctrlKey" D.bool)
        |> D.andThen
            (\( k, ctrl ) ->
                case ( k, ctrl ) of
                    ( "Escape", _ ) ->
                        D.succeed ThemeCancel

                    ( "Enter", _ ) ->
                        D.succeed ThemeConfirm

                    ( "ArrowDown", _ ) ->
                        D.succeed (ThemeMove 1)

                    ( "ArrowUp", _ ) ->
                        D.succeed (ThemeMove -1)

                    ( "n", True ) ->
                        D.succeed (ThemeMove 1)

                    ( "p", True ) ->
                        D.succeed (ThemeMove -1)

                    _ ->
                        D.fail "typing"
            )


viewThemePicker : Model -> Html Msg
viewThemePicker model =
    case model.picker of
        Nothing ->
            text ""

        Just p ->
            let
                hits =
                    Theme.search p.query model.themes

                row i s =
                    div [ classList [ ( "hit", True ), ( "current", i == p.sel ) ] ]
                        [ span [ class "hitid" ] [ text s.name ]
                        , span [ class "hitfield" ] [ text (s.system ++ " " ++ s.variant) ]
                        ]

                rows =
                    List.indexedMap Tuple.pair hits
                        |> List.filterMap (\( i, idx ) -> List.drop idx model.themes |> List.head |> Maybe.map (row i))
            in
            div [ class "finder" ]
                [ div [ class "finderbox" ]
                    [ div [ class "findhead" ]
                        [ span [ class "findmode" ] [ text "THEME" ]
                        , span [ class "dim" ] [ text "live preview · Enter keep · Esc restore" ]
                        ]
                    , Html.input
                        [ A.id "theme-picker"
                        , A.value p.query
                        , A.placeholder "type to filter themes"
                        , A.autocomplete False
                        , onInput ThemeInput
                        , Html.Events.on "keydown" themeKeys
                        ]
                        []
                    , div [ class "hits" ]
                        (if List.isEmpty hits then
                            [ div [ class "dim hitnone" ] [ text "no theme matches" ] ]

                         else
                            rows
                        )
                    , div [ class "dim findfoot" ] [ text "↑ ↓ or Ctrl+p Ctrl+n preview · Enter keep · Esc restore" ]
                    ]
                ]


focusThemePicker : Cmd Msg
focusThemePicker =
    Dom.focus "theme-picker" |> Task.attempt (\_ -> NoOp)


{-| Go to a search hit: switch repo if it is in another one, select the bead and
open its discussion.
-}
openHit : Hit -> Model -> ( Model, Cmd Msg )
openHit h model =
    if model.current == Just h.repo then
        openDetail h.id { model | selId = Just h.id }

    else
        ( { model | current = Just h.repo, beads = Loading, selId = Just h.id, detail = Nothing, version = Nothing, focus = Just h.id }
        , Cmd.batch [ getBeads h.repo, getEdges h.repo ]
        )


openDetail : String -> Model -> ( Model, Cmd Msg )
openDetail id model =
    case ( model.current, model.beads ) of
        ( Just repo, Ready bs ) ->
            case List.filter (\b -> b.id == id) bs |> List.head of
                Just b ->
                    ( { model | detail = Just { id = id, bead = Ready b, comments = Loading } }
                    , Cmd.batch [ getBead repo id, getComments repo id, reveal model.view ]
                    )

                Nothing ->
                    ( model, Cmd.none )

        _ ->
            ( model, Cmd.none )


focusFinder : Cmd Msg
focusFinder =
    Dom.focus "finder" |> Task.attempt (\_ -> NoOp)


viewOrder : List View
viewOrder =
    [ KanbanView, ListView, EpicsView, StoryMapView, RoadmapView, IterationsView, WaterfallView, GraphView, FlowView, MetricsView, MatrixView ]


{-| gt, gT, Tab, [v and ]v: the view `d` steps along viewOrder, wrapping around.
-}
stepView : Int -> View -> View
stepView d v =
    let
        i =
            viewOrder |> List.indexedMap Tuple.pair |> List.filter (\( _, x ) -> x == v) |> List.head |> Maybe.map Tuple.first |> Maybe.withDefault 0
    in
    viewOrder |> List.drop (modBy (List.length viewOrder) (i + d)) |> List.head |> Maybe.withDefault KanbanView


{-| -}
stepRepo : Int -> Model -> ( Model, Cmd Msg )
stepRepo d model =
    case model.repos of
        Ready rs ->
            let
                names =
                    List.map .name rs

                i =
                    names |> List.indexedMap Tuple.pair |> List.filter (\( _, n ) -> Just n == model.current) |> List.head |> Maybe.map Tuple.first |> Maybe.withDefault 0
            in
            case List.drop (modBy (max 1 (List.length names)) (i + d)) names |> List.head of
                Just name ->
                    update (Pick name) model

                Nothing ->
                    ( model, Cmd.none )

        _ ->
            ( model, Cmd.none )


{-| d and u: half a page down or up in the open discussion, else in the main pane.
-}
scrollPane : String -> Int -> Cmd Msg
scrollPane id dir =
    Dom.getViewportOf id
        |> Task.andThen (\v -> Dom.setViewportOf id v.viewport.x (max 0 (v.viewport.y + toFloat dir * v.viewport.height / 2)))
        |> Task.attempt (\_ -> NoOp)


{-| SPC Backspace: every key that does something from normal mode.
-}
viewAllKeys : Model -> Html Msg
viewAllKeys model =
    if not model.allKeys then
        text ""

    else
        div [ class "finder" ]
            [ div [ class "finderbox wide" ]
                [ div [ class "findhead" ]
                    [ span [ class "findmode" ] [ text "ALL KEYS" ]
                    , span [ class "dim" ] [ text (String.fromInt (List.length Keys.allKeys) ++ " keys from normal mode · Esc closes") ]
                    ]
                , div [ class "allkeys" ]
                    (List.map
                        (\( path, label ) ->
                            div [ class "keyrow" ]
                                [ span [ class "keys" ] [ text (String.join " " (List.map Keys.keyName path)) ]
                                , span [] [ text label ]
                                ]
                        )
                        Keys.allKeys
                    )
                ]
            ]


getMetrics : String -> Cmd Msg
getMetrics name =
    Http.get
        { url = repoUrl name "/metrics"
        , expect = Http.expectJson (GotMetrics name) Metrics.decoder
        }
