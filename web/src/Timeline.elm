module Timeline exposing
    ( Clock
    , Plan
    , Span
    , Zoom
    , cellLabel
    , defaultZoom
    , isoUtc
    , plan
    , slide
    , spans
    , stamp
    , stretch
    , topLabel
    , window
    , zoomAt
    , zooms
    )

{-| The waterfall's time axis. Every time here is in local minutes since
1970-01-01: the UTC minute plus the zone's offset, so a midnight is a multiple
of 1440. A task ends at its delivery time and started `minutes` earlier. The
zoom decides how many minutes one cell is, from a day down to five minutes,
because agents finish work in minutes.
-}

import Calendar
import Types exposing (Bead)


type alias Zoom =
    { cell : Int
    , name : String
    }


zooms : List Zoom
zooms =
    [ { cell = 1440, name = "day" }
    , { cell = 360, name = "6 hours" }
    , { cell = 60, name = "hour" }
    , { cell = 15, name = "15 min" }
    , { cell = 5, name = "5 min" }
    ]


defaultZoom : Int
defaultZoom =
    0


zoomAt : Int -> Zoom
zoomAt i =
    List.drop (max 0 (min (List.length zooms - 1) i)) zooms
        |> List.head
        |> Maybe.withDefault { cell = 1440, name = "day" }


{-| What the page knows about now: the zone offset in minutes and now as a
local minute.
-}
type alias Clock =
    { offset : Int
    , now : Int
    }


type alias Span =
    { bead : Bead
    , start : Int
    , end : Int
    , scheduled : Bool
    }


{-| What to store: the delivery time and the length in minutes.
-}
type alias Plan =
    { end : Int
    , minutes : Int
    }


{-| A bead with a delivery time and no estimate is taken to be a day long.
-}
duration : Bead -> Int
duration b =
    if b.estMin > 0 then
        b.estMin

    else
        1440


endOf : Int -> Bead -> Maybe Int
endOf offset b =
    b.dueMs |> Maybe.map (\ms -> ms // 60000 + offset)


plan : Clock -> Bead -> Plan
plan c b =
    { end = Maybe.withDefault c.now (endOf c.offset b), minutes = duration b }


{-| Rows in time order: scheduled work by start first, then the unscheduled by id.
An unscheduled bead sits on now.
-}
spans : Clock -> List Bead -> List Span
spans c beads =
    beads
        |> List.map
            (\b ->
                case endOf c.offset b of
                    Just e ->
                        { bead = b, start = e - duration b, end = e, scheduled = True }

                    Nothing ->
                        { bead = b, start = c.now, end = c.now, scheduled = False }
            )
        |> List.sortBy
            (\s ->
                if s.scheduled then
                    ( 0, s.start, s.bead.id )

                else
                    ( 1, 0, s.bead.id )
            )


{-| Move the whole task by `delta` cells; the length stays.
-}
slide : Int -> Int -> Clock -> Bead -> Plan
slide cell delta c b =
    let
        p =
            plan c b
    in
    { p | end = p.end + delta * cell }


{-| Move the delivery time by `delta` cells; the start stays, so the task gets
longer or shorter. It is never shorter than one cell.
-}
stretch : Int -> Int -> Clock -> Bead -> Plan
stretch cell delta c b =
    let
        p =
            plan c b

        minutes =
            max cell (p.minutes + delta * cell)
    in
    { end = p.end + (minutes - p.minutes), minutes = minutes }


floorTo : Int -> Int -> Int
floorTo cell m =
    cell * floor (toFloat m / toFloat cell)


{-| The cells to draw, as the first and last cell start. Normally everything:
a little before the earliest start or now, and well after the latest end. When
that would be more than 700 cells (hours of zoom over weeks of plan) the window
is 700 cells around `focus` instead.
-}
window : Int -> Int -> Clock -> List Span -> ( Int, Int )
window cell focus c ss =
    let
        first =
            List.minimum (c.now :: List.map .start ss) |> Maybe.withDefault c.now

        last =
            List.maximum (c.now :: List.map .end ss) |> Maybe.withDefault c.now

        from =
            floorTo cell (first - 8 * cell)

        to =
            floorTo cell (last + 24 * cell)

        cells =
            (to - from) // cell + 1
    in
    if cells <= 700 then
        ( from, from + (max 48 cells - 1) * cell )

    else
        let
            f =
                floorTo cell focus - 150 * cell
        in
        ( f, f + 699 * cell )


pad2 : Int -> String
pad2 n =
    String.padLeft 2 '0' (String.fromInt n)


clock : Int -> String
clock m =
    let
        t =
            modBy 1440 m
    in
    pad2 (t // 60) ++ ":" ++ pad2 (modBy 60 t)


{-| The label under a cell: the day of the month at day zoom, the hour at 6 hours
and 1 hour, hour and minute below that.
-}
cellLabel : Int -> Int -> String
cellLabel cell start =
    if cell >= 1440 then
        String.fromInt (Calendar.dayOfMonth (start // 1440))

    else if cell >= 60 then
        pad2 (modBy 1440 start // 60)

    else
        clock start


{-| The label above a cell, shown where something starts: a month at day zoom, a
date at midnight at finer zoom, always on the first cell.
-}
topLabel : Int -> Int -> Bool -> String
topLabel cell start isFirst =
    let
        day =
            start // 1440

        c =
            Calendar.civil day
    in
    if cell >= 1440 then
        if isFirst || c.day == 1 then
            Calendar.monthName c.month ++ " " ++ String.fromInt c.year

        else
            ""

    else if isFirst || modBy 1440 start == 0 then
        Calendar.monthName c.month ++ " " ++ String.fromInt c.day

    else
        ""


{-| A local time for people: date and hour:minute.
-}
stamp : Int -> String
stamp m =
    Calendar.toIso (m // 1440) ++ " " ++ clock m


{-| A UTC time for the server, from local minutes: RFC3339 to the minute.
-}
isoUtc : Int -> Int -> String
isoUtc offset local =
    let
        utc =
            local - offset
    in
    Calendar.toIso (utc // 1440) ++ "T" ++ clock utc ++ ":00Z"
