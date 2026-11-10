module KeysTest exposing (suite)

import Expect
import Keys exposing (Action(..), Outcome(..), View(..), hints, press)
import Test exposing (Test, describe, test)


suite : Test
suite =
    describe "Keys"
        [ test "single key runs" <|
            \_ -> press [] "j" |> Expect.equal (Run Down)
        , test "prefix waits" <|
            \_ -> press [] "g" |> Expect.equal (Wait [ "g" ])
        , test "gg is top" <|
            \_ -> press [ "g" ] "g" |> Expect.equal (Run Top)
        , test "leader sequence reaches kanban" <|
            \_ ->
                press [ " ", "v" ] "k" |> Expect.equal (Run (Show KanbanView))
        , test "unbound key cancels" <|
            \_ -> press [ "g" ] "x" |> Expect.equal Cancel
        , test "escape cancels" <|
            \_ -> press [ " " ] "Escape" |> Expect.equal Cancel
        , test "key after a finished sequence path cancels" <|
            \_ -> press [ "j" ] "k" |> Expect.equal Cancel
        , test "leader hints list the groups" <|
            \_ ->
                hints [ " " ]
                    |> Expect.equal [ ( "v", "view …" ), ( "t", "theme …" ), ( "r", "reload" ) ]
        ]
