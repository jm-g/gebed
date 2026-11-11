module Stats exposing (summary)

{-| The numbers in the status bar, per view.
-}

import Board
import Keys exposing (View(..))
import Schedule
import Types exposing (Bead, Edge, Status(..), statusLabel)


count : (Bead -> Bool) -> List Bead -> Int
count f =
    List.filter f >> List.length


n : Int -> String -> String
n k label =
    String.fromInt k ++ " " ++ label


summary : Int -> View -> List Bead -> List Edge -> List String
summary today view beads edges =
    case view of
        KanbanView ->
            n (List.length beads) "beads"
                :: List.map (\( s, bs ) -> n (List.length bs) (statusLabel s)) (Board.columns beads)

        ListView ->
            [ n (List.length beads) "beads"
            , n (count (\b -> b.status /= Closed) beads) "open"
            , n (count (\b -> b.status == Closed) beads) "closed"
            , n (count (\b -> b.priority <= 1 && b.status /= Closed) beads) "urgent"
            ]

        GraphView ->
            [ n (List.length beads) "nodes"
            , n (List.length (List.filter (\e -> e.toRepo == "") edges)) "links"
            , n (List.length (List.filter (\e -> e.toRepo /= "") edges)) "cross-repo"
            ]

        WaterfallView ->
            let
                ss =
                    Schedule.spans today beads

                late =
                    List.filter (\s -> s.scheduled && s.end < today && s.bead.status /= Closed) ss
            in
            [ n (List.length (List.filter .scheduled ss)) "scheduled"
            , n (List.length (List.filter (not << .scheduled) ss)) "unscheduled"
            , n (List.length late) "late"
            ]
