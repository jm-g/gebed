module Charts exposing (viewBoard, viewEpics, viewFlow, viewMatrix, viewMetrics)

{-| The board-like views, the epics view and the charts. They take the message
to send when a card is clicked, so they work for any program.
-}

import Agile exposing (Col, Flow)
import Calendar
import Html exposing (Html, div, span, text)
import Html.Attributes as A exposing (class, classList)
import Html.Events exposing (onClick)
import Metrics exposing (Metrics)
import Svg
import Svg.Attributes as SA
import Types exposing (Bead, Status(..))
import Widgets


{-| Columns of cards: kanban, story map, roadmap, iterations.
-}
viewBoard : (String -> msg) -> Maybe String -> List Col -> Html msg
viewBoard select sel cols =
    div [ class "kanban" ] (List.map (column select sel) cols)


column : (String -> msg) -> Maybe String -> Col -> Html msg
column select sel col =
    div [ class ("col st-" ++ col.accent) ]
        [ div [ class "colhead" ]
            [ span [ class "colname" ] [ text col.title ]
            , span [ class "colcount" ] [ text (String.fromInt (List.length col.beads)) ]
            ]
        , if String.isEmpty col.note then
            text ""

          else
            div [ class "colnote" ] [ text col.note ]
        , div [ class "cards" ]
            (if List.isEmpty col.beads then
                [ div [ class "colempty" ] [ text "nothing here" ] ]

             else
                List.map (Widgets.card select sel) col.beads
            )
        ]



-- EPICS


viewEpics : (String -> msg) -> Maybe String -> List Agile.EpicGroup -> Html msg
viewEpics select sel groups =
    if List.isEmpty groups then
        div [ class "empty" ]
            [ div [ class "dtitle" ] [ text "No epics yet" ]
            , div [] [ text "Make a bead of kind epic, then press SPC e e on a bead to put it in the epic." ]
            ]

    else
        div [ class "epics" ] (List.map (epicBlock select sel) groups)


epicBlock : (String -> msg) -> Maybe String -> Agile.EpicGroup -> Html msg
epicBlock select sel g =
    let
        ( done, total ) =
            Agile.progress g.children

        pct =
            if total == 0 then
                0

            else
                100 * done // total

        count s =
            List.length (List.filter (\b -> b.status == s) g.children)

        seg cls n =
            div [ class ("seg " ++ cls), A.style "flex" (String.fromInt n) ] []

        head =
            case g.epic of
                Just e ->
                    div
                        (selAttr sel e.id ++ [ classList [ ( "epichead", True ), ( "current", sel == Just e.id ) ], onClick (select e.id) ])
                        [ span [ class "id" ] [ text e.id ]
                        , Widgets.prioBadge e
                        , span [ class "etitle" ] [ text e.title ]
                        , span [ class "epct" ] [ text (String.fromInt pct ++ "%  " ++ String.fromInt done ++ "/" ++ String.fromInt total) ]
                        ]

                Nothing ->
                    div [ class "epichead noepic" ] [ span [ class "etitle" ] [ text "No epic" ], span [ class "epct" ] [ text (String.fromInt total ++ " beads") ] ]
    in
    div [ class "epic" ]
        [ head
        , div [ class "bar-stack" ]
            [ seg "done" (count Closed)
            , seg "doing" (count InProgress)
            , seg "blocked" (count Blocked)
            , seg "open" (count Open)
            ]
        , div [ class "echildren" ] (List.map (child select sel) g.children)
        ]


selAttr : Maybe String -> String -> List (Html.Attribute msg)
selAttr sel id =
    if sel == Just id then
        [ A.id "sel" ]

    else
        []


child : (String -> msg) -> Maybe String -> Bead -> Html msg
child select sel b =
    div (selAttr sel b.id ++ [ classList [ ( "echild", True ), ( "current", sel == Just b.id ) ], onClick (select b.id) ])
        [ Widgets.prioBadge b
        , span [ class "id" ] [ text b.id ]
        , span [ class ("status st-" ++ Widgets.statusClass b.status) ] [ text (statusText b.status) ]
        , span [ class "ltitle" ] [ text b.title ]
        ]


statusText : Status -> String
statusText s =
    case s of
        InProgress ->
            "doing"

        Open ->
            "open"

        Blocked ->
            "blocked"

        Closed ->
            "done"

        _ ->
            "other"



-- FLOW METRICS


viewFlow : Flow -> Html msg
viewFlow f =
    div [ class "flow" ]
        [ div [ class "chart" ] [ div [ class "ctitle" ] [ text "Burnup: scope and done" ], burnup f ]
        , div [ class "chart" ] [ div [ class "ctitle" ] [ text "Throughput: beads closed per week" ], throughput f ]
        , div [ class "chart" ]
            [ div [ class "ctitle" ] [ text "Lead time: days from created to closed" ]
            , leadTime f
            ]
        ]


chartW : Float
chartW =
    560


chartH : Float
chartH =
    160


f2 : Float -> String
f2 x =
    String.fromFloat (toFloat (round (x * 10)) / 10)


burnup : Flow -> Html msg
burnup f =
    let
        n =
            List.length f.weeks

        top =
            toFloat (max 1 (List.maximum (List.map .totalCreated f.weeks) |> Maybe.withDefault 1))

        x i =
            40 + toFloat i * (chartW - 60) / toFloat (max 1 (n - 1))

        y v =
            chartH - 20 - toFloat v / top * (chartH - 40)

        points sel =
            f.weeks |> List.indexedMap (\i w -> f2 (x i) ++ "," ++ f2 (y (sel w))) |> String.join " "
    in
    Svg.svg [ SA.width (String.fromFloat chartW), SA.height (String.fromFloat chartH), SA.class "svgchart" ]
        [ Svg.line [ SA.x1 "40", SA.y1 (f2 (chartH - 20)), SA.x2 (f2 (chartW - 20)), SA.y2 (f2 (chartH - 20)), SA.class "axis" ] []
        , Svg.text_ [ SA.x "4", SA.y "24", SA.class "axistext" ] [ Svg.text (String.fromInt (round top)) ]
        , Svg.polyline [ SA.points (points .totalCreated), SA.class "line scope" ] []
        , Svg.polyline [ SA.points (points .totalClosed), SA.class "line done" ] []
        , Svg.text_ [ SA.x (f2 (chartW - 120)), SA.y "14", SA.class "lscope" ] [ Svg.text "— scope" ]
        , Svg.text_ [ SA.x (f2 (chartW - 60)), SA.y "14", SA.class "ldone" ] [ Svg.text "— done" ]
        ]


throughput : Flow -> Html msg
throughput f =
    let
        top =
            max 1 (List.maximum (List.map .closed f.weeks) |> Maybe.withDefault 1)
    in
    div [ class "bars" ]
        (List.map
            (\w ->
                div [ class "barcol" ]
                    [ div [ class "barnum" ] [ text (String.fromInt w.closed) ]
                    , div [ class "barfill", A.style "height" (String.fromInt (100 * w.closed // top) ++ "%") ] []
                    , div [ class "barlabel" ] [ text (Calendar.monthName (Calendar.civil w.start).month ++ " " ++ String.fromInt (Calendar.civil w.start).day) ]
                    ]
            )
            f.weeks
        )


leadTime : Flow -> Html msg
leadTime f =
    if List.isEmpty f.leadDays then
        div [ class "dim" ] [ text "No closed beads yet." ]

    else
        let
            top =
                toFloat (max 1 (List.maximum f.leadDays |> Maybe.withDefault 1))

            n =
                List.length f.leadDays

            x i =
                30 + toFloat i * (chartW - 50) / toFloat (max 1 (n - 1))

            y d =
                chartH - 20 - toFloat d / top * (chartH - 40)

            sorted =
                List.sort f.leadDays

            rule label d cls =
                [ Svg.line [ SA.x1 "30", SA.y1 (f2 (y d)), SA.x2 (f2 (chartW - 20)), SA.y2 (f2 (y d)), SA.class ("rule " ++ cls) ] []
                , Svg.text_ [ SA.x (f2 (chartW - 90)), SA.y (f2 (y d - 3)), SA.class "axistext" ] [ Svg.text (label ++ " " ++ String.fromInt d ++ "d") ]
                ]
        in
        Svg.svg [ SA.width (String.fromFloat chartW), SA.height (String.fromFloat chartH), SA.class "svgchart" ]
            (List.indexedMap (\i d -> Svg.circle [ SA.cx (f2 (x i)), SA.cy (f2 (y d)), SA.r "3.5", SA.class "dot" ] []) sorted
                ++ rule "p50" f.p50 "p50"
                ++ rule "p85" f.p85 "p85"
                ++ rule "p95" f.p95 "p95"
            )



-- IMPACT / EFFORT MATRIX


viewMatrix : (String -> msg) -> Maybe String -> List Bead -> Html msg
viewMatrix select sel beads =
    div [ class "matrix" ]
        (div [ class "mrow mhead" ] (div [ class "mcell mlabel" ] [ text "priority \\ effort" ] :: List.map (\b -> div [ class "mcell" ] [ text b ]) Agile.matrixBuckets)
            :: List.map
                (\p ->
                    div [ class "mrow" ]
                        (div [ class ("mcell mlabel p" ++ String.fromInt p) ] [ text ("P" ++ String.fromInt p) ]
                            :: List.map
                                (\c ->
                                    div [ class ("mcell" ++ quick p c) ]
                                        (List.map (mini select sel) (Agile.matrixCell p c beads))
                                )
                                (List.range 0 4)
                        )
                )
                (List.range 0 4)
        )


{-| The corner worth doing first: important and small.
-}
quick : Int -> Int -> String
quick p c =
    if p <= 1 && (c == 1 || c == 2) then
        " quickwin"

    else
        ""


mini : (String -> msg) -> Maybe String -> Bead -> Html msg
mini select sel b =
    div (selAttr sel b.id ++ [ classList [ ( "mini", True ), ( "current", sel == Just b.id ) ], onClick (select b.id), A.title b.title ])
        [ span [ class "id" ] [ text b.id ], text (" " ++ String.left 22 b.title) ]



-- AGENT METRICS


viewMetrics : Maybe Metrics -> Html msg
viewMetrics mm =
    case mm of
        Nothing ->
            div [ class "empty" ] [ text "loading metrics…" ]

        Just m ->
            div [ class "metrics" ]
                (if m.reports == 0 && m.weighed == 0 then
                    [ div [ class "empty" ]
                        [ div [ class "dtitle" ] [ text "Nothing measured yet" ]
                        , div [] [ text "Agents report what they measure with gebed_report: outcome, weight, complexity, minutes, attempts, tokens, tests and capacity." ]
                        , div [ class "dim" ] [ text "The gebed-pm skill tells them how. Install it with: gebed skill install" ]
                        ]
                    ]

                 else
                    [ div [ class "kpis" ] (kpis m)
                    , div [ class "mgrid" ]
                        [ panel "Velocity: points closed per week" (velocityBars m)
                        , panel "Outcomes of reports" (outcomeBars m)
                        , panel "Capacity: agents and what they can run at once" (capacityList m)
                        , panel "Work in progress that has not moved" (agingList m)
                        , panel "Complexity: how often work succeeds" (levelBars m.complexity)
                        , panel "Weight: beads per size" (levelBars m.weights)
                        ]
                    ]
                )


panel : String -> Html msg -> Html msg
panel title body =
    div [ class "panel" ] [ div [ class "ctitle" ] [ text title ], body ]


pctText : Maybe Float -> String
pctText v =
    case v of
        Just x ->
            String.fromInt (round x) ++ "%"

        Nothing ->
            "—"


one : Maybe Float -> String -> String
one v unit =
    case v of
        Just x ->
            String.fromFloat (toFloat (round (x * 10)) / 10) ++ unit

        Nothing ->
            "—"


kpi : String -> String -> String -> String -> Html msg
kpi tone label value note =
    div [ class ("kpi " ++ tone), A.title note ]
        [ div [ class "kpival" ] [ text value ]
        , div [ class "kpilabel" ] [ text label ]
        , div [ class "kpinote" ] [ text note ]
        ]


kpis : Metrics -> List (Html msg)
kpis m =
    let
        good v hi lo =
            case v of
                Nothing ->
                    "none"

                Just x ->
                    if x >= hi then
                        "good"

                    else if x >= lo then
                        "warn"

                    else
                        "bad"

        bias =
            case m.estimateBias of
                Just b ->
                    if b > 0 then
                        "took " ++ String.fromInt (round b) ++ "% longer than estimated"

                    else
                        "took " ++ String.fromInt (round (abs b)) ++ "% less than estimated"

                Nothing ->
                    "no estimate to compare with yet"
    in
    [ kpi "none" "velocity" (one m.avgVelocity " pts/wk") "average points closed per week over the last 4 weeks"
    , kpi "none" "forecast" (one m.forecastWeeks " wk") (String.fromInt m.pointsRemaining ++ " points left at that pace")
    , kpi (good m.successRate 80 60) "success rate" (pctText m.successRate) (String.fromInt m.reports ++ " reports")
    , kpi
        (case m.reworkRate of
            Nothing ->
                "none"

            Just r ->
                if r <= 20 then
                    "good"

                else if r <= 40 then
                    "warn"

                else
                    "bad"
        )
        "rework"
        (pctText m.reworkRate)
        "reports that needed more than one attempt"
    , kpi "none" "estimate error" (pctText m.estimateMape) (String.fromInt m.estimateSamples ++ " beads · " ++ bias)
    , kpi "none" "utilization" (pctText m.utilization) (String.fromInt m.wip ++ " in progress, capacity " ++ String.fromInt m.capacity)
    , kpi "none" "minutes / point" (one m.minutesPerPoint "") "actual work minutes per point of weight"
    , kpi "none" "tokens / point" (thousands m.tokensPerPoint) (String.fromInt (round (Maybe.withDefault 0 m.costCentsPerPoint)) ++ " cents per point")
    , kpi "none" "flow efficiency" (pctText m.flowEfficiency) "work time as a share of the time from created to closed"
    , kpi "none" "lead time" (String.fromInt (round m.leadMedianH) ++ " h") "median hours from created to closed"
    , kpi
        (good (Just (100 - Maybe.withDefault 100 m.testPassPct)) 0 0
            |> always
                (if m.testPassPct == Nothing then
                    "none"

                 else
                    "good"
                )
        )
        "tests passing"
        (pctText m.testPassPct)
        "of the tests agents reported"
    , kpi
        (if m.blocked > 0 then
            "warn"

         else
            "none"
        )
        "blocked"
        (String.fromInt m.blocked)
        (String.fromInt m.lowConfid ++ " reports under 60% confidence")
    ]


{-| 29444 as 29.4k, so a big number stays readable.
-}
thousands : Maybe Float -> String
thousands v =
    case v of
        Just x ->
            if x >= 1000 then
                one (Just (x / 1000)) "k"

            else
                one (Just x) ""

        Nothing ->
            "—"


velocityBars : Metrics -> Html msg
velocityBars m =
    let
        top =
            max 1 (List.maximum (List.map .points m.velocity) |> Maybe.withDefault 1)
    in
    div [ class "bars small" ]
        (List.map
            (\w ->
                div [ class "barcol" ]
                    [ div [ class "barnum" ] [ text (String.fromInt w.points) ]
                    , div [ class "barfill", A.style "height" (String.fromInt (100 * w.points // top) ++ "%") ] []
                    , div [ class "barlabel" ] [ text (String.dropLeft 5 w.start) ]
                    ]
            )
            m.velocity
        )


outcomeBars : Metrics -> Html msg
outcomeBars m =
    let
        total =
            max 1 (List.sum (List.map Tuple.second m.outcomes))
    in
    div [ class "outcomes" ]
        (List.map
            (\( name, n ) ->
                div [ class "outrow" ]
                    [ span [ class ("outname out-" ++ name) ] [ text name ]
                    , div [ class "outtrack" ] [ div [ class ("outfill out-" ++ name), A.style "width" (String.fromInt (100 * n // total) ++ "%") ] [] ]
                    , span [ class "dim" ] [ text (String.fromInt n) ]
                    ]
            )
            (List.sortBy Tuple.first m.outcomes)
        )


capacityList : Metrics -> Html msg
capacityList m =
    if List.isEmpty m.agents then
        div [ class "dim" ] [ text "No agent has reported its capacity yet." ]

    else
        div [ class "outcomes" ]
            (List.map
                (\a ->
                    div [ class "outrow" ]
                        [ span [ class "outname" ] [ text a.agent ]
                        , div [ class "outtrack" ] [ div [ class "outfill out-success", A.style "width" (String.fromInt (min 100 (a.capacity * 100 // max 1 (List.maximum (List.map .capacity m.agents) |> Maybe.withDefault 1))) ++ "%") ] [] ]
                        , span [ class "dim" ] [ text (String.fromInt a.capacity ++ " at once") ]
                        ]
                )
                m.agents
            )


agingList : Metrics -> Html msg
agingList m =
    if List.isEmpty m.aging then
        div [ class "dim" ] [ text "Nothing is in progress." ]

    else
        div [ class "aging" ]
            (List.map
                (\a ->
                    div [ class "agerow" ]
                        [ span [ class "id" ] [ text a.id ]
                        , span [ class "ltitle" ] [ text a.title ]
                        , span
                            [ class
                                (if a.hours > 48 then
                                    "late"

                                 else
                                    "dim"
                                )
                            ]
                            [ text (ageText a.hours) ]
                        ]
                )
                m.aging
            )


ageText : Float -> String
ageText h =
    if h < 1 then
        "just now"

    else if h < 48 then
        String.fromInt (round h) ++ " h"

    else
        String.fromInt (round (h / 24)) ++ " days"


levelBars : List Metrics.Level -> Html msg
levelBars ls =
    if List.isEmpty ls then
        div [ class "dim" ] [ text "Nothing reported yet." ]

    else
        let
            top =
                max 1 (List.maximum (List.map .beads ls) |> Maybe.withDefault 1)
        in
        div [ class "outcomes" ]
            (List.map
                (\l ->
                    div [ class "outrow" ]
                        [ span [ class "outname" ] [ text (String.fromInt l.level) ]
                        , div [ class "outtrack" ]
                            [ div [ class "outfill out-success", A.style "width" (String.fromInt (100 * l.success // top) ++ "%") ] []
                            , div [ class "outfill out-partial", A.style "width" (String.fromInt (100 * (l.beads - l.success) // top) ++ "%") ] []
                            ]
                        , span [ class "dim" ] [ text (String.fromInt l.success ++ "/" ++ String.fromInt l.beads ++ " ok") ]
                        ]
                )
                ls
            )
