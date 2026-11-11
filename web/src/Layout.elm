module Layout exposing (Node, layers)

{-| Pure layout for the dependency graph.
-}

import Board
import Dict exposing (Dict)
import Types exposing (Bead, Edge)


type alias Node =
    { bead : Bead
    , layer : Int
    , row : Int
    }


{-| Edge types that order work: the target must come first.
-}
orders : String -> Bool
orders kind =
    List.member kind [ "blocks", "parent-child", "conditional-blocks", "waits-for" ]


{-| Column per bead: 0 when it depends on nothing in this repo, else one more
than its deepest dependency. Cross-repo and non-ordering edges do not count.
A cycle stops after one pass per bead, so the layout always ends.
-}
layers : List Bead -> List Edge -> List Node
layers beads edges =
    let
        local =
            List.filter (\e -> e.toRepo == "" && orders e.kind) edges

        step : Dict String Int -> Dict String Int
        step layer =
            List.foldl
                (\e acc ->
                    let
                        need =
                            1 + Maybe.withDefault 0 (Dict.get e.to acc)
                    in
                    if need > Maybe.withDefault 0 (Dict.get e.from acc) then
                        Dict.insert e.from need acc

                    else
                        acc
                )
                layer
                local

        settled =
            List.foldl (\_ acc -> step acc) Dict.empty (List.range 1 (List.length beads))

        n =
            List.length beads

        -- a DAG never needs more than n - 1 columns; a cycle would grow past it
        layerOf b =
            Dict.get b.id settled |> Maybe.withDefault 0 |> min (n - 1)

        sorted =
            Board.ordered beads

        rowIn : Int -> List Bead -> List Node
        rowIn l bs =
            List.indexedMap (\i b -> { bead = b, layer = l, row = i }) bs
    in
    List.range 0 (n - 1)
        |> List.concatMap (\l -> rowIn l (List.filter (\b -> layerOf b == l) sorted))
