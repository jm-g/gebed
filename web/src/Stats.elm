module Stats exposing (summary)

{-| The numbers in the status bar, per view.
-}

import Agile
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

        EpicsView ->
            let
                groups =
                    List.filter (\g -> g.epic /= Nothing) (Agile.epicGroups beads)

                ( done, total ) =
                    Agile.progress (List.concatMap .children groups)
            in
            [ n (List.length groups) "epics", String.fromInt done ++ "/" ++ String.fromInt total ++ " stories done" ]

        StoryMapView ->
            [ n (List.length (List.filter (\g -> g.epic /= Nothing) (Agile.epicGroups beads))) "epics", n (List.length beads) "beads" ]

        RoadmapView ->
            List.map (\c -> n (List.length c.beads) c.title) (Agile.roadmapCols today beads)

        IterationsView ->
            Agile.iterationCols today beads |> List.filter (\c -> not (List.isEmpty c.beads)) |> List.map (\c -> n (List.length c.beads) c.title)

        FlowView ->
            let
                f =
                    Agile.flow today beads
            in
            [ "lead time p50 " ++ String.fromInt f.p50 ++ "d", "p85 " ++ String.fromInt f.p85 ++ "d", n (List.sum (List.map .closed f.weeks)) "closed in 8 weeks" ]

        MatrixView ->
            let
                quick =
                    List.concatMap (\p -> List.concatMap (\c -> Agile.matrixCell p c beads) [ 1, 2 ]) [ 0, 1 ]
            in
            [ n (List.length (List.filter (\b -> b.status /= Closed) beads)) "open", n (List.length quick) "quick wins (P0-P1, up to 3 days)" ]

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
