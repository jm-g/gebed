module AgileTest exposing (suite)

import Agile
import Calendar
import Expect
import Keys exposing (View(..))
import Nav
import Test exposing (Test, describe, test)
import Types exposing (Bead, Status(..))


bead : String -> String -> Status -> Int -> Bead
bead id kind status prio =
    { id = id
    , title = id
    , description = ""
    , status = status
    , kind = kind
    , priority = prio
    , assignee = ""
    , owner = ""
    , labels = []
    , depCount = 0
    , dependentCount = 0
    , deps = []
    , due = ""
    , estDays = 0
    , dueMs = Nothing
    , estMin = 0
    , epics = []
    , createdMs = 0
    , updatedMs = 0
    , closedMs = Nothing
    }


inEpic : String -> Bead -> Bead
inEpic e b =
    { b | epics = [ { id = e, title = e } ] }


due : String -> Int -> Bead -> Bead
due iso days b =
    { b | due = iso, estDays = days }


times : Int -> Maybe Int -> Bead -> Bead
times created closed b =
    { b | createdMs = created, closedMs = closed }


ids : List Bead -> List String
ids =
    List.map .id


day : String -> Int
day iso =
    Calendar.fromIso iso |> Maybe.withDefault 0


{-| e1 has a1 (closed) and a2; e2 has b1; l1 has no epic.
-}
world : List Bead
world =
    [ bead "e1" "epic" Open 1
    , bead "e2" "epic" Open 0
    , bead "a1" "task" Closed 2 |> inEpic "e1"
    , bead "a2" "task" Open 0 |> inEpic "e1"
    , bead "b1" "task" InProgress 1 |> inEpic "e2"
    , bead "l1" "task" Open 3
    ]


suite : Test
suite =
    describe "Agile"
        [ test "epic groups: epics by priority, children by priority, loose beads last" <|
            \_ ->
                Agile.epicGroups world
                    |> List.map (\g -> ( Maybe.map .id g.epic, ids g.children ))
                    |> Expect.equal [ ( Just "e2", [ "b1" ] ), ( Just "e1", [ "a2", "a1" ] ), ( Nothing, [ "l1" ] ) ]
        , test "progress counts closed over total" <|
            \_ -> Agile.progress (List.filter (\b -> List.any (\r -> r.id == "e1") b.epics) world) |> Expect.equal ( 1, 2 )
        , test "story map: one column per epic with the epic on top" <|
            \_ ->
                Agile.storyCols world
                    |> List.map (\c -> ( c.title, ids c.beads ))
                    |> Expect.equal [ ( "e2", [ "e2", "b1" ] ), ( "e1", [ "e1", "a2", "a1" ] ), ( "No epic", [ "l1" ] ) ]
        , test "roadmap: in progress is Now; urgent open is Next; the rest Later; closed hidden" <|
            \_ ->
                Agile.roadmapCols 0 world
                    |> List.map (\c -> ( c.title, ids c.beads ))
                    |> Expect.equal [ ( "Now", [ "b1" ] ), ( "Next", [ "a2", "e2", "e1" ] ), ( "Later", [ "l1" ] ) ]
        , test "roadmap: an open bead due within two weeks is Now" <|
            \_ ->
                let
                    t =
                        day "2026-11-10"
                in
                Agile.roadmapCols t [ bead "x" "task" Open 3 |> due "2026-11-20" 1 ]
                    |> List.map (\c -> ( c.title, ids c.beads ))
                    |> Expect.equal [ ( "Now", [ "x" ] ), ( "Next", [] ), ( "Later", [] ) ]
        , test "weekStart is the Monday" <|
            \_ ->
                -- 2026-11-10 is a Tuesday; its Monday is 2026-11-09
                Agile.weekStart (day "2026-11-10") |> Expect.equal (day "2026-11-09")
        , test "iterations: overdue, this week, a later week, unscheduled" <|
            \_ ->
                let
                    t =
                        day "2026-11-10"

                    bs =
                        [ bead "late" "task" Open 1 |> due "2026-11-02" 1
                        , bead "now" "task" Open 1 |> due "2026-11-12" 2
                        , bead "next" "task" Open 1 |> due "2026-11-18" 1
                        , bead "none" "task" Open 1
                        , bead "done" "task" Closed 1 |> due "2026-11-12" 1
                        ]
                in
                Agile.iterationCols t bs
                    |> List.filter (\c -> not (List.isEmpty c.beads))
                    |> List.map (\c -> ( c.title, ids c.beads ))
                    |> Expect.equal [ ( "Overdue", [ "late" ] ), ( "This week", [ "now" ] ), ( "Nov 16 – 22", [ "next" ] ), ( "Unscheduled", [ "none" ] ) ]
        , test "iteration capacity counts days of work" <|
            \_ ->
                Agile.iterationCols (day "2026-11-10") [ bead "a" "task" Open 1 |> due "2026-11-12" 2, bead "b" "task" Open 1 |> due "2026-11-13" 3 ]
                    |> List.filter (\c -> c.title == "This week")
                    |> List.map .note
                    |> Expect.equal [ "5 days of work" ]
        , test "percentile" <|
            \_ ->
                ( Agile.percentile 50 [ 1, 2, 3, 4, 5 ], Agile.percentile 85 [ 1, 2, 3, 4, 5 ], Agile.percentile 50 [] )
                    |> Expect.equal ( 3, 5, 0 )
        , test "flow: lead time of a closed bead, weekly closed count" <|
            \_ ->
                let
                    d =
                        86400000

                    t =
                        day "2026-11-10"

                    closedNow =
                        times ((t - 4) * d) (Just (t * d)) (bead "c" "task" Closed 1)

                    f =
                        Agile.flow t [ closedNow, times ((t - 1) * d) Nothing (bead "open" "task" Open 1) ]
                in
                ( ( f.leadDays, f.p50 ), ( List.sum (List.map .closed f.weeks), List.length f.weeks ) )
                    |> Expect.equal ( ( [ 4 ], 4 ), ( 1, 8 ) )
        , test "flow: running totals never go down" <|
            \_ ->
                let
                    d =
                        86400000

                    t =
                        day "2026-11-10"

                    f =
                        Agile.flow t (List.map (\i -> times ((t - 7 * i) * d) (Just ((t - 7 * i + 2) * d)) (bead "x" "task" Closed 1)) (List.range 0 5))
                in
                (List.map .totalCreated f.weeks == List.sort (List.map .totalCreated f.weeks) && List.map .totalClosed f.weeks == List.sort (List.map .totalClosed f.weeks))
                    |> Expect.equal True
        , test "matrix: priority row by effort column, open beads only" <|
            \_ ->
                let
                    bs =
                        [ bead "q" "task" Open 0 |> due "2026-11-12" 1
                        , bead "big" "task" Open 0 |> due "2026-11-12" 9
                        , bead "done" "task" Closed 0 |> due "2026-11-12" 1
                        ]
                in
                ( ids (Agile.matrixCell 0 1 bs), ids (Agile.matrixCell 0 4 bs), ids (Agile.matrixCell 1 1 bs) )
                    |> Expect.equal ( [ "q" ], [ "big" ], [] )
        , test "board-like views share columns, so h and l move the same way" <|
            \_ ->
                [ KanbanView, StoryMapView, RoadmapView, IterationsView ]
                    |> List.map (\v -> Agile.columnsFor 0 v world /= Nothing)
                    |> Expect.equal [ True, True, True, True ]
        , test "Nav: l moves to the next epic column in the story map" <|
            \_ ->
                Nav.step 0 StoryMapView Keys.Right (Just "e2") world |> Expect.equal (Just "e1")
        , test "Nav: j walks the epics view top to bottom" <|
            \_ ->
                Nav.step 0 EpicsView Keys.Down (Just "e2") world |> Expect.equal (Just "b1")
        ]
