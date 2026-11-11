module TimelineTest exposing (suite)

import Calendar
import Expect
import Test exposing (Test, describe, test)
import Timeline
import Types exposing (Bead, Status(..))


bead : String -> Maybe Int -> Int -> Bead
bead id dueMs estMin =
    { id = id
    , title = id
    , description = ""
    , status = Open
    , kind = "task"
    , priority = 1
    , assignee = ""
    , owner = ""
    , labels = []
    , depCount = 0
    , dependentCount = 0
    , deps = []
    , due = ""
    , estDays = 0
    , dueMs = dueMs
    , estMin = estMin
    , epics = []
    , createdMs = 0
    , updatedMs = 0
    , closedMs = Nothing
    }


{-| A zone 6 hours behind UTC, and now = 2026-11-10 10:00 local.
-}
clock : Timeline.Clock
clock =
    { offset = -360, now = Calendar.fromYmd 2026 11 10 * 1440 + 600 }


{-| 2026-11-10 12:30 local is 18:30 UTC.
-}
dueAt : Int -> Int
dueAt localMinute =
    (localMinute - clock.offset) * 60000


noon : Int
noon =
    Calendar.fromYmd 2026 11 10 * 1440 + 750


suite : Test
suite =
    describe "Timeline"
        [ test "a task ends at its delivery time, in local minutes, and starts its length earlier" <|
            \_ ->
                Timeline.spans clock [ bead "a" (Just (dueAt noon)) 20 ]
                    |> List.map (\s -> ( s.end, s.end - s.start, s.scheduled ))
                    |> Expect.equal [ ( noon, 20, True ) ]
        , test "a delivery time with no estimate is a day long" <|
            \_ ->
                Timeline.plan clock (bead "a" (Just (dueAt noon)) 0) |> Expect.equal { end = noon, minutes = 1440 }
        , test "an unscheduled task sits on now and comes after the scheduled ones" <|
            \_ ->
                Timeline.spans clock [ bead "u" Nothing 0, bead "s" (Just (dueAt noon)) 10 ]
                    |> List.map (\s -> ( s.bead.id, s.scheduled ))
                    |> Expect.equal [ ( "s", True ), ( "u", False ) ]
        , test "slide moves by whole cells at the current zoom and keeps the length" <|
            \_ ->
                ( Timeline.slide 15 2 clock (bead "a" (Just (dueAt noon)) 20), Timeline.slide 1440 -1 clock (bead "a" (Just (dueAt noon)) 20) )
                    |> Expect.equal ( { end = noon + 30, minutes = 20 }, { end = noon - 1440, minutes = 20 } )
        , test "stretch keeps the start: the delivery time and the length move together" <|
            \_ ->
                let
                    p0 =
                        Timeline.plan clock (bead "a" (Just (dueAt noon)) 20)

                    p1 =
                        Timeline.stretch 5 3 clock (bead "a" (Just (dueAt noon)) 20)
                in
                ( p1.end - p1.minutes, p1.minutes ) |> Expect.equal ( p0.end - p0.minutes, 35 )
        , test "a task is never shorter than one cell" <|
            \_ ->
                Timeline.stretch 15 -5 clock (bead "a" (Just (dueAt noon)) 20) |> .minutes |> Expect.equal 15
        , test "an unscheduled task slides from now" <|
            \_ ->
                Timeline.slide 60 1 clock (bead "u" Nothing 0) |> Expect.equal { end = clock.now + 60, minutes = 1440 }
        , test "the window is aligned to cells and holds now" <|
            \_ ->
                let
                    ( from, to ) =
                        Timeline.window 60 clock.now clock []
                in
                ( ( modBy 60 from, modBy 60 to ), ( from <= clock.now && clock.now <= to, (to - from) // 60 + 1 >= 48 ) )
                    |> Expect.equal ( ( 0, 0 ), ( True, True ) )
        , test "a plan that is too long for the zoom gives a window of 700 cells around the focus" <|
            \_ ->
                let
                    far =
                        bead "far" (Just (dueAt (noon + 60 * 1440))) 20

                    ( from, to ) =
                        Timeline.window 5 noon clock (Timeline.spans clock [ far ])
                in
                ( (to - from) // 5 + 1, from < noon && noon < to ) |> Expect.equal ( 700, True )
        , test "cell labels: day number, hour, hour:minute" <|
            \_ ->
                let
                    d =
                        Calendar.fromYmd 2026 11 7 * 1440
                in
                [ Timeline.cellLabel 1440 d, Timeline.cellLabel 360 (d + 720), Timeline.cellLabel 15 (d + 8 * 60 + 45) ]
                    |> Expect.equal [ "7", "12", "08:45" ]
        , test "the top label names the month at day zoom and the date at midnight below it" <|
            \_ ->
                let
                    d =
                        Calendar.fromYmd 2026 12 1 * 1440
                in
                [ Timeline.topLabel 1440 d False, Timeline.topLabel 60 d False, Timeline.topLabel 60 (d + 60) False, Timeline.topLabel 60 (d + 60) True ]
                    |> Expect.equal [ "Dec 2026", "Dec 1", "", "Dec 1" ]
        , test "isoUtc turns local minutes back into the UTC time the server stores" <|
            \_ ->
                Timeline.isoUtc clock.offset noon |> Expect.equal "2026-11-10T18:30:00Z"
        , test "stamp is date and local clock time" <|
            \_ -> Timeline.stamp noon |> Expect.equal "2026-11-10 12:30"
        ]
