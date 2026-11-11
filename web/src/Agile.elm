module Agile exposing
    ( Col
    , EpicGroup
    , Flow
    , WeekStat
    , columnsFor
    , epicGroups
    , flow
    , iterationCols
    , matrixBuckets
    , matrixCell
    , percentile
    , progress
    , roadmapCols
    , storyCols
    , weekStart
    )

{-| The agile views as pure data: epics, story map, roadmap, iterations, flow
metrics and the impact/effort matrix. Rendering lives in Charts.
-}

import Board
import Calendar
import Keys exposing (View(..))
import Schedule
import Types exposing (Bead, Status(..), statusLabel)


{-| A board column: a title, a color name for CSS, a note under the title and
the beads in it.
-}
type alias Col =
    { title : String
    , accent : String
    , note : String
    , beads : List Bead
    }


byPrio : List Bead -> List Bead
byPrio =
    List.sortBy (\b -> ( b.priority, b.id ))


isEpic : Bead -> Bool
isEpic b =
    b.kind == "epic"


isOpen : Bead -> Bool
isOpen b =
    b.status /= Closed && b.status /= Tombstone


{-| The columns of every board-like view, so h and l mean the same everywhere.
-}
columnsFor : Int -> View -> List Bead -> Maybe (List Col)
columnsFor today view beads =
    case view of
        KanbanView ->
            Just
                (List.map
                    (\( s, bs ) -> { title = statusLabel s, accent = accentOf s, note = "", beads = bs })
                    (Board.columns beads)
                )

        StoryMapView ->
            Just (storyCols beads)

        RoadmapView ->
            Just (roadmapCols today beads)

        IterationsView ->
            Just (iterationCols today beads)

        _ ->
            Nothing


accentOf : Status -> String
accentOf s =
    case s of
        Open ->
            "open"

        InProgress ->
            "doing"

        Blocked ->
            "blocked"

        Closed ->
            "done"

        _ ->
            "other"



-- EPICS


type alias EpicGroup =
    { epic : Maybe Bead
    , children : List Bead
    }


{-| Epics in priority order, each with its children; beads with no epic come last.
-}
epicGroups : List Bead -> List EpicGroup
epicGroups beads =
    let
        epics =
            beads |> List.filter isEpic |> byPrio

        childrenOf e =
            beads
                |> List.filter (\b -> not (isEpic b) && List.any (\r -> r.id == e.id) b.epics)
                |> byPrio

        loose =
            beads |> List.filter (\b -> not (isEpic b) && List.isEmpty b.epics) |> byPrio
    in
    List.map (\e -> { epic = Just e, children = childrenOf e }) epics
        ++ (if List.isEmpty loose then
                []

            else
                [ { epic = Nothing, children = loose } ]
           )


{-| Closed and total.
-}
progress : List Bead -> ( Int, Int )
progress bs =
    ( List.length (List.filter (\b -> b.status == Closed) bs), List.length bs )



-- STORY MAP


{-| One column per epic, the epic on top and its stories under it by priority.
-}
storyCols : List Bead -> List Col
storyCols beads =
    epicGroups beads
        |> List.map
            (\g ->
                let
                    ( done, total ) =
                        progress g.children
                in
                case g.epic of
                    Just e ->
                        { title = e.title
                        , accent = "epic"
                        , note = String.fromInt done ++ "/" ++ String.fromInt total ++ " done"
                        , beads = e :: g.children
                        }

                    Nothing ->
                        { title = "No epic", accent = "other", note = String.fromInt total ++ " stories", beads = g.children }
            )



-- ROADMAP


{-| Now: being worked on or due within two weeks. Next: urgent or due within
six weeks. Later: everything else that is still open. Closed work is not shown.
-}
roadmapCols : Int -> List Bead -> List Col
roadmapCols today beads =
    let
        live =
            List.filter isOpen beads

        dueIn b =
            Schedule.dueDay b |> Maybe.map (\d -> d - today)

        isNow b =
            b.status == InProgress || b.status == Blocked || (b.status == Open && (dueIn b |> Maybe.map (\n -> n <= 14) |> Maybe.withDefault False))

        isNext b =
            b.priority <= 1 || (dueIn b |> Maybe.map (\n -> n <= 42) |> Maybe.withDefault False)

        now =
            List.filter isNow live

        rest =
            List.filter (not << isNow) live

        next =
            List.filter isNext rest

        later =
            List.filter (not << isNext) rest

        col title accent note bs =
            { title = title, accent = accent, note = note, beads = byPrio bs }
    in
    [ col "Now" "doing" "in progress, blocked, or due in 2 weeks" now
    , col "Next" "open" "urgent, or due in 6 weeks" next
    , col "Later" "other" "everything else still open" later
    ]



-- ITERATIONS


{-| The Monday of the week that holds `day`. 1970-01-01 was a Thursday.
-}
weekStart : Int -> Int
weekStart day =
    day - modBy 7 (day + 3)


span : Int -> String
span from =
    let
        a =
            Calendar.civil from

        b =
            Calendar.civil (from + 6)
    in
    Calendar.monthName a.month
        ++ " "
        ++ String.fromInt a.day
        ++ " – "
        ++ (if a.month == b.month then
                ""

            else
                Calendar.monthName b.month ++ " "
           )
        ++ String.fromInt b.day


{-| Overdue, then six weeks starting this one, then later, then unscheduled; the
note of each is how many days of work it holds.
-}
iterationCols : Int -> List Bead -> List Col
iterationCols today beads =
    let
        cur =
            weekStart today

        live =
            List.filter isOpen beads

        due b =
            Schedule.dueDay b

        inWeek i b =
            due b |> Maybe.map (\d -> d >= cur + 7 * i && d < cur + 7 * (i + 1)) |> Maybe.withDefault False

        days bs =
            String.fromInt (List.sum (List.map Schedule.width bs)) ++ " days of work"

        col title accent bs =
            { title = title, accent = accent, note = days bs, beads = byPrio bs }

        weeks =
            List.range 0 5
                |> List.map
                    (\i ->
                        col
                            (if i == 0 then
                                "This week"

                             else
                                span (cur + 7 * i)
                            )
                            (if i == 0 then
                                "doing"

                             else
                                "open"
                            )
                            (List.filter (inWeek i) live)
                    )
    in
    col "Overdue" "blocked" (List.filter (\b -> due b |> Maybe.map (\d -> d < cur) |> Maybe.withDefault False) live)
        :: weeks
        ++ [ col "Later" "other" (List.filter (\b -> due b |> Maybe.map (\d -> d >= cur + 42) |> Maybe.withDefault False) live)
           , col "Unscheduled" "other" (List.filter (\b -> due b == Nothing) live)
           ]



-- FLOW METRICS


type alias WeekStat =
    { start : Int
    , created : Int
    , closed : Int
    , totalCreated : Int
    , totalClosed : Int
    }


type alias Flow =
    { weeks : List WeekStat
    , leadDays : List Int
    , p50 : Int
    , p85 : Int
    , p95 : Int
    }


{-| Timestamps are UTC days: a bead made or closed near midnight can land one
day off. Weekly counts hide that.
-}
dayOfMs : Int -> Int
dayOfMs ms =
    ms // 86400000


percentile : Int -> List Int -> Int
percentile p xs =
    case List.sort xs of
        [] ->
            0

        sorted ->
            let
                n =
                    List.length sorted

                i =
                    ceiling (toFloat p / 100 * toFloat n) - 1
            in
            List.drop (max 0 (min (n - 1) i)) sorted |> List.head |> Maybe.withDefault 0


{-| The last eight weeks: what was created and closed each week, running totals
for the burnup, and how long closed beads took from creation to close.
-}
flow : Int -> List Bead -> Flow
flow today beads =
    let
        cur =
            weekStart today

        starts =
            List.range 0 7 |> List.map (\i -> cur - 7 * (7 - i))

        createdDay b =
            dayOfMs b.createdMs

        closedDay b =
            b.closedMs |> Maybe.map dayOfMs

        stat s =
            { start = s
            , created = List.length (List.filter (\b -> createdDay b >= s && createdDay b < s + 7) beads)
            , closed = List.length (List.filter (\b -> closedDay b |> Maybe.map (\d -> d >= s && d < s + 7) |> Maybe.withDefault False) beads)
            , totalCreated = List.length (List.filter (\b -> createdDay b < s + 7) beads)
            , totalClosed = List.length (List.filter (\b -> closedDay b |> Maybe.map (\d -> d < s + 7) |> Maybe.withDefault False) beads)
            }

        lead =
            beads
                |> List.filterMap (\b -> closedDay b |> Maybe.map (\c -> max 0 (c - createdDay b)))
    in
    { weeks = List.map stat starts
    , leadDays = lead
    , p50 = percentile 50 lead
    , p85 = percentile 85 lead
    , p95 = percentile 95 lead
    }



-- IMPACT / EFFORT MATRIX


{-| Effort buckets, in days: none set, up to 1, 2 to 3, 4 to 7, 8 or more.
-}
matrixBuckets : List String
matrixBuckets =
    [ "no estimate", "≤ 1 day", "2–3 days", "4–7 days", "8+ days" ]


bucketOf : Bead -> Int
bucketOf b =
    if b.estDays <= 0 then
        0

    else if b.estDays <= 1 then
        1

    else if b.estDays <= 3 then
        2

    else if b.estDays <= 7 then
        3

    else
        4


{-| The open beads of one cell: priority row (0 is most important) by effort column.
-}
matrixCell : Int -> Int -> List Bead -> List Bead
matrixCell prio bucket beads =
    beads |> List.filter (\b -> isOpen b && b.priority == prio && bucketOf b == bucket) |> List.sortBy .id
