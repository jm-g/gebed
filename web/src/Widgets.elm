module Widgets exposing
    ( card
    , chips
    , dueText
    , prioBadge
    , statusClass
    )

{-| Small pieces every view shares: priority badge, label and epic chips, card.
-}

import Html exposing (Html, div, span, text)
import Html.Attributes as A exposing (class, classList)
import Html.Events exposing (onClick)
import Types exposing (Bead, Status(..))


statusClass : Status -> String
statusClass s =
    case s of
        Open ->
            "open"

        InProgress ->
            "doing"

        Blocked ->
            "blocked"

        Closed ->
            "done"

        _ ->
            "other"


prioName : Int -> String
prioName p =
    case p of
        0 ->
            "critical"

        1 ->
            "high"

        2 ->
            "medium"

        3 ->
            "low"

        _ ->
            "backlog"


prioBadge : Bead -> Html msg
prioBadge b =
    span [ class ("prio p" ++ String.fromInt b.priority), A.title (prioName b.priority) ] [ text ("P" ++ String.fromInt b.priority) ]


dueText : Bead -> String
dueText b =
    if String.isEmpty b.due then
        ""

    else
        String.dropLeft 5 b.due


{-| A label keeps one color: the same word always gets the same hue.
-}
labelChip : String -> Html msg
labelChip l =
    span [ class ("chip lc" ++ String.fromInt (modBy 7 (List.sum (List.map Char.toCode (String.toList l))))) ] [ text l ]


{-| The epics of a bead show as tags too, marked with a diamond.
-}
epicChip : String -> Html msg
epicChip title =
    span [ class "chip epictag" ] [ text ("◆ " ++ title) ]


chips : Bead -> Html msg
chips b =
    span [ class "chips" ] (List.map epicChip (List.map .title b.epics) ++ List.map labelChip b.labels)


card : (String -> msg) -> Maybe String -> Bead -> Html msg
card select sel b =
    div
        ((if sel == Just b.id then
            [ A.id "sel" ]

          else
            []
         )
            ++ [ classList [ ( "card", True ), ( "current", sel == Just b.id ), ( "isepic", b.kind == "epic" ) ], onClick (select b.id) ]
        )
        [ div [ class "cardtop" ]
            [ span [ class "id" ] [ text b.id ]
            , prioBadge b
            , span [ class "kind" ] [ text b.kind ]
            ]
        , div [ class "ctitle" ] [ text b.title ]
        , if List.isEmpty b.labels && List.isEmpty b.epics then
            text ""

          else
            chips b
        , div [ class "cardfoot" ]
            [ span []
                [ text
                    (if String.isEmpty b.assignee then
                        ""

                     else
                        "@" ++ b.assignee
                    )
                ]
            , span []
                [ text
                    (if String.isEmpty b.due then
                        ""

                     else
                        "due " ++ dueText b
                    )
                ]
            , span []
                [ text
                    (if b.depCount > 0 then
                        "⛓ " ++ String.fromInt b.depCount

                     else
                        ""
                    )
                ]
            ]
        ]
