module Stats exposing (summary, tab)

{-| The numbers in the status bar, per view.
-}

import Agile
import Board
import Keys exposing (View(..))
import Timeline
import Types exposing (Bead, Edge, Status(..), statusLabel)


count : (Bead -> Bool) -> List Bead -> Int
count f =
    List.filter f >> List.length


n : Int -> String -> String
n k label =
    String.fromInt k ++ " " ++ label


summary : Int -> Timeline.Clock -> View -> List Bead -> List Edge -> List String
summary today clock view beads edges =
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

        MetricsView ->
            [ n (outcomes beads) "reports", n (List.length (List.filter (\b -> weightOf b > 0) beads)) "weighed" ]

        MatrixView ->
            let
                quick =
                    List.concatMap (\p -> List.concatMap (\c -> Agile.matrixCell p c beads) [ 1, 2 ]) [ 0, 1 ]
            in
            [ n (List.length (List.filter (\b -> b.status /= Closed) beads)) "open", n (List.length quick) "quick wins (P0-P1, up to 3 days)" ]

        WaterfallView ->
            let
                ss =
                    Timeline.spans clock beads

                late =
                    List.filter (\s -> s.scheduled && s.end < clock.now && s.bead.status /= Closed) ss
            in
            [ n (List.length (List.filter .scheduled ss)) "scheduled"
            , n (List.length (List.filter (not << .scheduled) ss)) "unscheduled"
            , n (List.length late) "late"
            ]


{-| One number for a tab of the view bar: how much there is to see in that view.
-}
tab : Int -> Timeline.Clock -> View -> List Bead -> List Edge -> String
tab today clock view beads edges =
    let
        k =
            String.fromInt
    in
    case view of
        KanbanView ->
            k (List.length beads)

        ListView ->
            k (count (\b -> b.status /= Closed) beads)

        GraphView ->
            k (List.length edges)

        WaterfallView ->
            k (List.length (List.filter .scheduled (Timeline.spans clock beads)))

        EpicsView ->
            k (List.length (List.filter (\g -> g.epic /= Nothing) (Agile.epicGroups beads)))

        StoryMapView ->
            k (List.length (List.filter (\g -> g.epic /= Nothing) (Agile.epicGroups beads)))

        RoadmapView ->
            Agile.roadmapCols today beads |> List.head |> Maybe.map (.beads >> List.length >> k) |> Maybe.withDefault "0"

        IterationsView ->
            Agile.iterationCols today beads |> List.drop 1 |> List.head |> Maybe.map (.beads >> List.length >> k) |> Maybe.withDefault "0"

        FlowView ->
            k (List.sum (List.map .closed (Agile.flow today beads).weeks))

        MetricsView ->
            k (outcomes beads)

        MatrixView ->
            k (List.length (List.concatMap (\p -> List.concatMap (\c -> Agile.matrixCell p c beads) [ 1, 2 ]) [ 0, 1 ]))


{-| Beads an agent has reported an outcome on: they carry an outcome: label.
-}
outcomes : List Bead -> Int
outcomes =
    List.length << List.filter (List.any (String.startsWith "outcome:") << .labels)


weightOf : Bead -> Int
weightOf b =
    b.labels |> List.filter (String.startsWith "weight:") |> List.head |> Maybe.andThen (String.dropLeft 7 >> String.toInt) |> Maybe.withDefault 0
