module Metrics exposing (Aged, AgentCap, Level, Metrics, Week, decoder)

{-| The flow metrics the server computes from beads and agent reports. A value
that could not be measured is Nothing, never zero.
-}

import Json.Decode as D exposing (Decoder)


type alias Week =
    { start : String
    , points : Int
    , closed : Int
    }


type alias Aged =
    { id : String
    , title : String
    , hours : Float
    }


type alias AgentCap =
    { agent : String
    , capacity : Int
    }


type alias Level =
    { level : Int
    , beads : Int
    , success : Int
    }


type alias Metrics =
    { beads : Int
    , closed : Int
    , wip : Int
    , blocked : Int
    , pointsTotal : Int
    , pointsDone : Int
    , pointsRemaining : Int
    , weighed : Int
    , velocity : List Week
    , avgVelocity : Maybe Float
    , forecastWeeks : Maybe Float
    , reports : Int
    , outcomes : List ( String, Int )
    , successRate : Maybe Float
    , reworkRate : Maybe Float
    , testPassPct : Maybe Float
    , estimateSamples : Int
    , estimateMape : Maybe Float
    , estimateBias : Maybe Float
    , minutesPerPoint : Maybe Float
    , tokensPerPoint : Maybe Float
    , costCentsPerPoint : Maybe Float
    , flowEfficiency : Maybe Float
    , agents : List AgentCap
    , capacity : Int
    , utilization : Maybe Float
    , aging : List Aged
    , weights : List Level
    , complexity : List Level
    , findings : Int
    , lowConfid : Int
    , leadMedianH : Float
    }


andMap : Decoder a -> Decoder (a -> b) -> Decoder b
andMap =
    D.map2 (|>)


opt : String -> Decoder (Maybe Float)
opt name =
    D.maybe (D.field name D.float)


int : String -> Decoder Int
int name =
    D.field name D.int


list : String -> Decoder a -> Decoder (List a)
list name d =
    D.oneOf [ D.field name (D.list d), D.succeed [] ]


decoder : Decoder Metrics
decoder =
    D.succeed Metrics
        |> andMap (int "beads")
        |> andMap (int "closed")
        |> andMap (int "wip")
        |> andMap (int "blocked")
        |> andMap (int "pointsTotal")
        |> andMap (int "pointsDone")
        |> andMap (int "pointsRemaining")
        |> andMap (int "weighed")
        |> andMap (list "velocity" (D.map3 Week (D.field "start" D.string) (int "points") (int "closed")))
        |> andMap (opt "avgVelocity")
        |> andMap (opt "forecastWeeks")
        |> andMap (int "reports")
        |> andMap (D.oneOf [ D.field "outcomes" (D.keyValuePairs D.int), D.succeed [] ])
        |> andMap (opt "successRate")
        |> andMap (opt "reworkRate")
        |> andMap (opt "testPassPct")
        |> andMap (int "estimateSamples")
        |> andMap (opt "estimateMape")
        |> andMap (opt "estimateBias")
        |> andMap (opt "minutesPerPoint")
        |> andMap (opt "tokensPerPoint")
        |> andMap (opt "costCentsPerPoint")
        |> andMap (opt "flowEfficiency")
        |> andMap (list "agents" (D.map2 AgentCap (D.field "agent" D.string) (int "capacity")))
        |> andMap (int "capacity")
        |> andMap (opt "utilization")
        |> andMap (list "aging" (D.map3 Aged (D.field "id" D.string) (D.field "title" D.string) (D.field "hours" D.float)))
        |> andMap (list "weights" levelDecoder)
        |> andMap (list "complexity" levelDecoder)
        |> andMap (int "findings")
        |> andMap (int "lowConfid")
        |> andMap (D.field "leadMedianH" D.float)


levelDecoder : Decoder Level
levelDecoder =
    D.map3 Level (int "level") (int "beads") (int "success")
