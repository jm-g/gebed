module KeysTest exposing (suite)

import Expect
import Keys exposing (Action(..), ComposeKind(..), Outcome(..), View(..), hints, press)
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
        , test "edit status sequence" <|
            \_ ->
                press [ " ", "e", "s" ] "p" |> Expect.equal (Run (SetStatus "in_progress"))
        , test "views and link keys" <|
            \_ ->
                [ press [ " ", "v" ] "g", press [ " ", "v" ] "w", press [ " ", "e" ] "l", press [ " ", "e" ] "+" ]
                    |> Expect.equal [ Run (Show GraphView), Run (Show WaterfallView), Run (Compose Link), Run (Compose AddLabel) ]
        , test "priority digits" <|
            \_ ->
                press [ " ", "e", "p" ] "0" |> Expect.equal (Run (SetPriority 0))
        , test "comment and ask open the composer" <|
            \_ ->
                [ press [] "c", press [] "a", press [] "n" ]
                    |> Expect.equal [ Run (Compose Discuss), Run (Compose Ask), Run (Compose NewBead) ]
        , test "leader hints list the groups" <|
            \_ ->
                hints [ " " ]
                    |> Expect.equal [ ( "v", "view …" ), ( "e", "edit …" ), ( "t", "theme …" ), ( "r", "reload" ) ]
        ]
