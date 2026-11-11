module KeysTest exposing (suite)

import Expect
import Keys exposing (Action(..), ComposeKind(..), Dir(..), Outcome(..), View(..), hints, press)
import Scroll exposing (Place(..))
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
        , test "every key in the all-keys list works: its prefixes wait and the last key runs" <|
            \_ ->
                let
                    reaches ( path, _ ) =
                        case List.reverse path of
                            [] ->
                                False

                            lastKey :: restRev ->
                                let
                                    prefix =
                                        List.reverse restRev

                                    waits =
                                        List.range 1 (List.length prefix)
                                            |> List.all (\n -> press (List.take (n - 1) prefix) (List.drop (n - 1) prefix |> List.head |> Maybe.withDefault "") == Wait (List.take n prefix))
                                in
                                waits
                                    && (case press prefix lastKey of
                                            Run _ ->
                                                True

                                            _ ->
                                                False
                                       )
                in
                Keys.allKeys |> List.filter (not << reaches) |> Expect.equal []
        , test "all-keys has no duplicate sequences and includes SPC Backspace itself" <|
            \_ ->
                let
                    paths =
                        List.map Tuple.first Keys.allKeys
                in
                ( List.length paths
                    == List.length
                        (List.foldl
                            (\p acc ->
                                if List.member p acc then
                                    acc

                                else
                                    p :: acc
                            )
                            []
                            paths
                        )
                , List.member [ " ", "Backspace" ] paths
                )
                    |> Expect.equal ( True, True )
        , test "vim motions: gt gT [[ ]] { } zt zz zb" <|
            \_ ->
                [ press [ "g" ] "t", press [ "g" ] "T", press [ "[" ] "[", press [ "]" ] "]", press [] "{", press [] "}", press [ "z" ] "t", press [ "z" ] "z", press [ "z" ] "b" ]
                    |> Expect.equal
                        [ Run (ViewStep 1), Run (ViewStep -1), Run (Section -1), Run (Section 1), Run (SectionEdge -1), Run (SectionEdge 1), Run (Align AtTop), Run (Align AtMiddle), Run (Align AtBottom) ]
        , test "repos and views by bracket, zoom by plus and minus" <|
            \_ ->
                [ press [ "[" ] "r", press [ "]" ] "r", press [ "[" ] "v", press [ "]" ] "v", press [] "+", press [] "-", press [] "0", press [] "Tab" ]
                    |> Expect.equal [ Run (RepoStep -1), Run (RepoStep 1), Run (ViewStep -1), Run (ViewStep 1), Run (Zoom 1), Run (Zoom -1), Run ZoomReset, Run (ViewStep 1) ]
        , test "SPC v d opens the agent metrics view" <|
            \_ -> press [ " ", "v" ] "d" |> Expect.equal (Run (Show MetricsView))
        , test "SPC S opens the sponsor page" <|
            \_ -> press [ " " ] "S" |> Expect.equal (Run Sponsor)
        , test "SPC Backspace opens the list" <|
            \_ -> press [ " " ] "Backspace" |> Expect.equal (Run ShowAllKeys)
        , test "leader hints list the groups" <|
            \_ ->
                hints [ " " ]
                    |> Expect.equal [ ( "v", "view …" ), ( "e", "edit …" ), ( "p", "project …" ), ( "t", "theme …" ), ( "r", "reload" ), ( "⌫", "ALL keys" ), ( "S", "Sponsor <3 (opens in a new tab)" ) ]
        ]
