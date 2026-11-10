module BoardTest exposing (suite)

import Board
import Expect
import Test exposing (Test, describe, test)
import Types exposing (Bead, Status(..))


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
        , test "columns group by status in board order" <|
            \_ ->
                [ bead "x" Closed 1, bead "y" Open 3, bead "z" Open 1 ]
                    |> Board.columns
                    |> List.map (\( l, bs ) -> ( l, List.map .id bs ))
                    |> Expect.equal [ ( "open", [ "z", "y" ] ), ( "closed", [ "x" ] ) ]
        , test "unknown status gets its own column last" <|
            \_ ->
                [ bead "a" (Other "review") 1, bead "b" Open 1 ]
                    |> Board.columns
                    |> List.map Tuple.first
                    |> Expect.equal [ "open", "review" ]
        ]
