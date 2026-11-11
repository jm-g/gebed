module MetricsTest exposing (suite)

import Expect
import Json.Decode as D
import Metrics
import Test exposing (Test, describe, test)


minimal : String
minimal =
    """{"beads":3,"closed":1,"wip":1,"blocked":0,"pointsTotal":0,"pointsDone":0,"pointsRemaining":0,"weighed":0,
"velocity":[{"start":"2026-11-09","points":0,"closed":0}],"reports":0,"outcomes":{},"estimateSamples":0,
"agents":null,"capacity":0,"aging":null,"weights":[],"complexity":[],"findings":0,"lowConfid":0,"leadMedianH":0}"""


suite : Test
suite =
    describe "Metrics decoder"
        [ test "a value that was not measured is Nothing, and null lists are empty" <|
            \_ ->
                case D.decodeString Metrics.decoder minimal of
                    Ok m ->
                        ( ( m.successRate, m.avgVelocity, m.utilization ), ( List.length m.agents, List.length m.aging ) )
                            |> Expect.equal ( ( Nothing, Nothing, Nothing ), ( 0, 0 ) )

                    Err e ->
                        Expect.fail (D.errorToString e)
        , test "measured values come through, including the outcome counts" <|
            \_ ->
                let
                    json =
                        String.replace "\"outcomes\":{}" "\"outcomes\":{\"success\":2,\"failure\":1},\"successRate\":66.7,\"forecastWeeks\":5" minimal
                in
                case D.decodeString Metrics.decoder json of
                    Ok m ->
                        ( m.outcomes, m.successRate, m.forecastWeeks ) |> Expect.equal ( [ ( "success", 2 ), ( "failure", 1 ) ], Just 66.7, Just 5 )

                    Err e ->
                        Expect.fail (D.errorToString e)
        , test "a missing required count is an error, not a zero" <|
            \_ ->
                D.decodeString Metrics.decoder (String.replace "\"wip\":1," "" minimal)
                    |> Result.map (always ())
                    |> Expect.err
        ]
