module Charts exposing (viewBoard, viewEpics, viewFlow, viewMatrix)

{-| The board-like views, the epics view and the charts. They take the message
to send when a card is clicked, so they work for any program.
-}

import Agile exposing (Col, Flow)
import Calendar
import Html exposing (Html, div, span, text)
import Html.Attributes as A exposing (class, classList)
import Html.Events exposing (onClick)
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
