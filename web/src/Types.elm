module Types exposing
    ( Bead
    , Comment
    , Delivery
    , Dep
    , Edge
    , EpicRef
    , Hit
    , Repo
    , Session
    , Status(..)
    , beadDecoder
    , commentDecoder
    , deliveryDecoder
    , edgeDecoder
    , hitDecoder
    , repoDecoder
    , sessionDecoder
    , statusLabel
    )

import Json.Decode as D exposing (Decoder)


type Status
    = Open
    | InProgress
    | Blocked
    | Deferred
    | Draft
    | Closed
    | Tombstone
    | Pinned
    | Other String


statusFromString : String -> Status
statusFromString s =
    case s of
        "open" ->
            Open

        "in_progress" ->
            InProgress

        "blocked" ->
            Blocked

        "deferred" ->
            Deferred

        "draft" ->
            Draft

        "closed" ->
            Closed

        "tombstone" ->
            Tombstone

        "pinned" ->
            Pinned

        _ ->
            Other s


statusLabel : Status -> String
statusLabel s =
    case s of
        Open ->
            "open"

        InProgress ->
            "in_progress"

        Blocked ->
            "blocked"

        Deferred ->
            "deferred"

        Draft ->
            "draft"

        Closed ->
            "closed"

        Tombstone ->
            "tombstone"

        Pinned ->
            "pinned"

        Other o ->
            o


type alias Repo =
    { name : String
    , dir : String
    , backend : String
    }


type alias Dep =
    { on : String
    , kind : String
    }


type alias EpicRef =
    { id : String
    , title : String
    }


type alias Bead =
    { id : String
    , title : String
    , description : String
    , status : Status
    , kind : String
    , priority : Int
    , assignee : String
    , owner : String
    , labels : List String
    , depCount : Int
    , dependentCount : Int
    , deps : List Dep
    , due : String
    , estDays : Int
    , epics : List EpicRef
    , createdMs : Int
    , updatedMs : Int
    , closedMs : Maybe Int
    }


andMap : Decoder a -> Decoder (a -> b) -> Decoder b
andMap =
    D.map2 (|>)


repoDecoder : Decoder Repo
repoDecoder =
    D.map3 Repo
        (D.field "name" D.string)
        (D.field "dir" D.string)
        (D.field "backend" D.string)


depDecoder : Decoder Dep
depDecoder =
    D.map2 Dep (D.field "on" D.string) (D.field "type" D.string)


beadDecoder : Decoder Bead
beadDecoder =
    D.succeed Bead
        |> andMap (D.field "id" D.string)
        |> andMap (D.field "title" D.string)
        |> andMap (D.field "description" D.string)
        |> andMap (D.field "status" D.string |> D.map statusFromString)
        |> andMap (D.field "kind" D.string)
        |> andMap (D.field "priority" D.int)
        |> andMap (D.field "assignee" D.string)
        |> andMap (D.field "owner" D.string)
        |> andMap (D.field "labels" (D.list D.string))
        |> andMap (D.field "depCount" D.int)
        |> andMap (D.field "dependentCount" D.int)
        |> andMap (D.field "deps" (D.list depDecoder))
        |> andMap (D.field "due" D.string)
        |> andMap (D.field "estDays" D.int)
        |> andMap (D.field "epics" (D.list epicRefDecoder))
        |> andMap (D.field "createdMs" D.int)
        |> andMap (D.field "updatedMs" D.int)
        |> andMap (D.field "closedMs" (D.nullable D.int))


type alias Comment =
    { id : String
    , author : String
    , text : String
    , created : String
    }


type alias Session =
    { nick : String
    , cwd : String
    , status : String
    }


{-| Result of sending a comment's mentions to live sessions.
-}
type alias Delivery =
    { name : String
    , delivered : Bool
    , error : String
    }


commentDecoder : Decoder Comment
commentDecoder =
    D.map4 Comment
        (D.field "id" D.string)
        (D.field "author" D.string)
        (D.field "text" D.string)
        (D.field "created" D.string)


sessionDecoder : Decoder Session
sessionDecoder =
    D.map3 Session
        (D.field "nick" D.string)
        (D.field "cwd" D.string)
        (D.field "status" D.string)


deliveryDecoder : Decoder Delivery
deliveryDecoder =
    D.map3 Delivery
        (D.field "name" D.string)
        (D.field "delivered" D.bool)
        (D.oneOf [ D.field "error" D.string, D.succeed "" ])


{-| `from` depends on `to`. `toRepo` is empty for a bead of the same repo, else
the name of the other repo (a cross-repo link).
-}
type alias Edge =
    { from : String
    , toRepo : String
    , to : String
    , kind : String
    }


edgeDecoder : Decoder Edge
edgeDecoder =
    D.map4 Edge
        (D.field "from" D.string)
        (D.field "toRepo" D.string)
        (D.field "to" D.string)
        (D.field "type" D.string)


epicRefDecoder : Decoder EpicRef
epicRefDecoder =
    D.map2 EpicRef (D.field "id" D.string) (D.field "title" D.string)


{-| One search result: which bead, which field matched, and the text around it.
-}
type alias Hit =
    { repo : String
    , id : String
    , title : String
    , status : String
    , field : String
    , snippet : String
    }


hitDecoder : Decoder Hit
hitDecoder =
    D.map6 Hit
        (D.field "repo" D.string)
        (D.field "id" D.string)
        (D.field "title" D.string)
        (D.field "status" D.string)
        (D.field "field" D.string)
        (D.field "snippet" D.string)
