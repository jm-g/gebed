module KeysTest exposing (suite)

import Expect
import Keys exposing (Action(..), ComposeKind(..), Dir(..), Outcome(..), View(..), hints, press)
import Test exposing (Test, describe, test)


suite : Test
suite =
    describe "Keys"
        [ test "single key runs" <|
            \_ -> press [] "j" |> Expect.equal (Run (Move Down))
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
        , test "add repo key" <|
            \_ ->
                press [ " ", "p" ] "a" |> Expect.equal (Run (Compose AddRepo))
        , test "priority digits" <|
            \_ ->
                press [ " ", "e", "p" ] "0" |> Expect.equal (Run (SetPriority 0))
        , test "comment and ask open the composer" <|
            \_ ->
                [ press [] "c", press [] "a", press [] "n" ]
                    |> Expect.equal [ Run (Compose Discuss), Run (Compose Ask), Run (Compose NewBead) ]
        , test "hjkl move, HJKL act on the card" <|
            \_ ->
                [ press [] "h", press [] "j", press [] "k", press [] "l", press [] "H", press [] "L", press [] "J", press [] "K", press [] "<", press [] ">" ]
                    |> Expect.equal
                        [ Run (Move Left), Run (Move Down), Run (Move Up), Run (Move Right), Run (Push -1), Run (Push 1), Run (Bump 1), Run (Bump -1), Run (Stretch -1), Run (Stretch 1) ]
        , test "leader hints list the groups" <|
            \_ ->
                hints [ " " ]
                    |> Expect.equal [ ( "v", "view …" ), ( "e", "edit …" ), ( "p", "project …" ), ( "t", "theme …" ), ( "r", "reload" ) ]
        ]
