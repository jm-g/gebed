module LayoutTest exposing (suite)

import Expect
import Layout
import Test exposing (Test, describe, test)
import Types exposing (Bead, Edge, Status(..))


bead : String -> Int -> Maybe Int -> Bead
bead id created closed =
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
    , dueMs = Nothing
    , estMin = 0
    , epics = []
    , createdMs = created
    , updatedMs = created + 10
    , closedMs = closed
    }


edge : String -> String -> Edge
edge from to =
    { from = from, toRepo = "", to = to, kind = "blocks" }


layerOf : String -> List Layout.Node -> Maybe Int
layerOf id nodes =
    nodes |> List.filter (\n -> n.bead.id == id) |> List.head |> Maybe.map .layer


suite : Test
suite =
    describe "Layout"
        [ test "a chain gets one column per step" <|
            \_ ->
                let
                    ns =
                        Layout.layers [ bead "a" 0 Nothing, bead "b" 0 Nothing, bead "c" 0 Nothing ]
                            [ edge "b" "a", edge "c" "b" ]
                in
                List.map (\i -> layerOf i ns) [ "a", "b", "c" ] |> Expect.equal [ Just 0, Just 1, Just 2 ]
        , test "a bead takes the deepest dependency" <|
            \_ ->
                let
                    ns =
                        Layout.layers [ bead "a" 0 Nothing, bead "b" 0 Nothing, bead "c" 0 Nothing ]
                            [ edge "b" "a", edge "c" "a", edge "c" "b" ]
                in
                layerOf "c" ns |> Expect.equal (Just 2)
        , test "a cycle still ends" <|
            \_ ->
                Layout.layers [ bead "a" 0 Nothing, bead "b" 0 Nothing ] [ edge "a" "b", edge "b" "a" ]
                    |> List.length
                    |> Expect.equal 2
        , test "cross-repo and related edges do not order" <|
            \_ ->
                let
                    ns =
                        Layout.layers [ bead "a" 0 Nothing, bead "b" 0 Nothing ]
                            [ { from = "a", toRepo = "other", to = "x", kind = "blocks" }
                            , { from = "b", toRepo = "", to = "a", kind = "related" }
                            ]
                in
                List.map (\i -> layerOf i ns) [ "a", "b" ] |> Expect.equal [ Just 0, Just 0 ]
        , test "every bead appears exactly once" <|
            \_ ->
                Layout.layers [ bead "a" 0 Nothing, bead "b" 0 Nothing, bead "c" 0 Nothing ] [ edge "c" "a" ]
                    |> List.map (.bead >> .id)
                    |> List.sort
                    |> Expect.equal [ "a", "b", "c" ]
        ]
