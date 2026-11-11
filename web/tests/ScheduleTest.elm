module ScheduleTest exposing (suite)

import Expect
import Schedule
import Test exposing (Test, describe, test)
import Types exposing (Bead, Status(..))


bead : String -> String -> Int -> Bead
bead id due days =
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
    , due = due
    , estDays = days
    , dueMs = Nothing
    , estMin = 0
    , epics = []
    , createdMs = 0
    , updatedMs = 0
    , closedMs = Nothing
    }


today : Int
today =
    100


suite : Test
suite =
    describe "Schedule"
        [ test "a scheduled bead ends on its due day and starts width days earlier" <|
            \_ ->
                Schedule.spans today [ bead "a" "2026-11-20" 3 ]
                    |> List.map (\s -> ( s.end - s.start + 1, s.scheduled ))
                    |> Expect.equal [ ( 3, True ) ]
        , test "no estimate means one day" <|
            \_ -> Schedule.width (bead "a" "2026-11-20" 0) |> Expect.equal 1
        , test "an unscheduled bead sits on today" <|
            \_ ->
                Schedule.spans today [ bead "a" "" 0 ]
                    |> List.map (\s -> ( s.start, s.end, s.scheduled ))
                    |> Expect.equal [ ( 100, 100, False ) ]
        , test "slide moves the delivery day and keeps the length" <|
            \_ ->
                let
                    b =
                        bead "a" "2026-11-20" 3

                    due =
                        Schedule.plan today b |> .due
                in
                Schedule.slide today 2 b |> Expect.equal { due = due + 2, days = 3 }
        , test "stretch moves the delivery day and the length together, so the start stays" <|
            \_ ->
                let
                    b =
                        bead "a" "2026-11-20" 3

                    p0 =
                        Schedule.plan today b

                    p1 =
                        Schedule.stretch today 1 b
                in
                ( p1.due - p1.days, p1.days ) |> Expect.equal ( p0.due - p0.days, 4 )
        , test "a task never gets shorter than one day" <|
            \_ ->
                Schedule.stretch today -5 (bead "a" "2026-11-20" 2)
                    |> .days
                    |> Expect.equal 1
        , test "sliding an unscheduled bead starts from today" <|
            \_ ->
                Schedule.slide today 3 (bead "a" "" 0) |> Expect.equal { due = 103, days = 1 }
        , test "rows are in time order" <|
            \_ ->
                Schedule.spans today [ bead "late" "2026-12-01" 1, bead "early" "2026-11-10" 1 ]
                    |> List.map (.bead >> .id)
                    |> Expect.equal [ "early", "late" ]
        , test "unscheduled beads come after the scheduled ones, whatever their ids" <|
            \_ ->
                Schedule.spans today [ bead "a" "" 0, bead "b" "2026-12-01" 1, bead "c" "" 0 ]
                    |> List.map (.bead >> .id)
                    |> Expect.equal [ "b", "a", "c" ]
        , test "the window always shows today and at least 42 days" <|
            \_ ->
                let
                    ( from, to ) =
                        Schedule.window today (Schedule.spans today [])
                in
                Expect.all [ \_ -> Expect.atMost today from, \_ -> Expect.atLeast today to, \_ -> Expect.atLeast 41 (to - from) ] ()
        ]
