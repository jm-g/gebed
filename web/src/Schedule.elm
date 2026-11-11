module Schedule exposing (Plan, Span, dueDay, plan, slide, spans, stretch, width, window)

{-| Waterfall math. A bead's delivery estimate is its due day; it started
`width` days earlier. A bead with no due day is unscheduled: it sits on today
until someone moves it.
-}

import Calendar
import Types exposing (Bead)


type alias Span =
    { bead : Bead
    , start : Int
    , end : Int
    , scheduled : Bool
    }


{-| What to store: the delivery day and the length in days.
-}
type alias Plan =
    { due : Int
    , days : Int
    }


dueDay : Bead -> Maybe Int
dueDay b =
    Calendar.fromIso b.due


width : Bead -> Int
width b =
    max 1 b.estDays


{-| The bead's plan as it stands; an unscheduled bead is due today.
-}
plan : Int -> Bead -> Plan
plan today b =
    { due = Maybe.withDefault today (dueDay b), days = width b }


{-| Move the whole task by `delta` days; the length stays.
-}
slide : Int -> Int -> Bead -> Plan
slide today delta b =
    let
        p =
            plan today b
    in
    { p | due = p.due + delta }


{-| Move the delivery day by `delta` days; the planned start stays, so the task
gets longer or shorter. A task is never shorter than one day.
-}
stretch : Int -> Int -> Bead -> Plan
stretch today delta b =
    let
        p =
            plan today b

        days =
            max 1 (p.days + delta)
    in
    { due = p.due + (days - p.days), days = days }


spanOf : Int -> Bead -> Span
spanOf today b =
    case dueDay b of
        Just due ->
            { bead = b, start = due - width b + 1, end = due, scheduled = True }

        Nothing ->
            { bead = b, start = today, end = today, scheduled = False }


{-| Rows in time order: scheduled work by start day first, then the unscheduled.
-}
spans : Int -> List Bead -> List Span
spans today beads =
    beads
        |> List.map (spanOf today)
        |> List.sortBy
            (\s ->
                ( if s.scheduled then
                    0

                  else
                    1
                , s.start
                , s.bead.id
                )
            )


{-| The days the timeline shows: a week before the earliest start or today, and
at least two weeks after the latest end, never fewer than 42 days.
-}
window : Int -> List Span -> ( Int, Int )
window today ss =
    let
        first =
            List.minimum (today :: List.map .start ss) |> Maybe.withDefault today

        last =
            List.maximum (today :: List.map .end ss) |> Maybe.withDefault today

        from =
            first - 7
    in
    ( from, max (from + 41) (last + 14) )
