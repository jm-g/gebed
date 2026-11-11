module Board exposing (columns, ordered, statusOrder)

import Types exposing (Bead, Status(..), statusLabel)


rank : Status -> Int
rank s =
    case s of
        Draft ->
            0

        Open ->
            1

        InProgress ->
            2

        Blocked ->
            3

        Deferred ->
            4

        Pinned ->
            5

        Closed ->
            6

        Tombstone ->
            7

        Other _ ->
            8


{-| Beads in board order: by status column, then priority (0 first), then id.
List view and kanban share it, so a selection means the same bead in both.
-}
ordered : List Bead -> List Bead
ordered =
    List.sortBy (\b -> ( rank b.status, b.priority, b.id ))


core : List Status
core =
    [ Open, InProgress, Blocked, Closed ]


{-| The statuses a board shows: the four that every project has, plus any other
status that some bead has, in workflow order.
-}
statusOrder : List Bead -> List Status
statusOrder beads =
    let
        present =
            List.map .status beads

        extra =
            List.filter (\s -> not (List.member s core)) present
    in
    (core ++ extra)
        |> List.foldl
            (\s acc ->
                if List.member s acc then
                    acc

                else
                    acc ++ [ s ]
            )
            []
        |> List.sortBy rank


{-| One column per status of `statusOrder`, empty ones included, so a card can be
moved into a column that has no cards yet.
-}
columns : List Bead -> List ( Status, List Bead )
columns beads =
    List.map
        (\s -> ( s, List.filter (\b -> statusLabel b.status == statusLabel s) (ordered beads) ))
        (statusOrder beads)
