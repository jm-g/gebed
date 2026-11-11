module BoardTest exposing (suite)

import Board
import Expect
import Test exposing (Test, describe, test)
import Types exposing (Bead, Status(..), statusLabel)


bead : String -> Status -> Int -> Bead
bead id status prio =
    { id = id
    , title = id
    , description = ""
    , status = status
    , kind = "task"
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


suite : Test
suite =
    describe "Board"
        [ test "ordered: status column, then priority, then id" <|
            \_ ->
                [ bead "c" Closed 0, bead "b" Open 2, bead "a" Open 1, bead "d" InProgress 0 ]
                    |> Board.ordered
                    |> List.map .id
                    |> Expect.equal [ "a", "b", "d", "c" ]
        , test "columns: the four core statuses always show, empty or not" <|
            \_ ->
                [ bead "x" Closed 1, bead "y" Open 3, bead "z" Open 1 ]
                    |> Board.columns
                    |> List.map (\( s, bs ) -> ( statusLabel s, List.map .id bs ))
                    |> Expect.equal [ ( "open", [ "z", "y" ] ), ( "in_progress", [] ), ( "blocked", [] ), ( "closed", [ "x" ] ) ]
        , test "an unknown status gets its own column after the core ones" <|
            \_ ->
                [ bead "a" (Other "review") 1, bead "b" Open 1 ]
                    |> Board.columns
                    |> List.map (Tuple.first >> statusLabel)
                    |> Expect.equal [ "open", "in_progress", "blocked", "closed", "review" ]
        ]
