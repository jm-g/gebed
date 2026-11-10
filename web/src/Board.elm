module Board exposing (columns, ordered)

import Types exposing (Bead, Status(..), statusLabel)


rank : Status -> Int
rank s =
    case s of
        Open ->
            1

        InProgress ->
            2

        Blocked ->
            3

        Deferred ->
            4

        Draft ->
            0

        Pinned ->
            5

        Closed ->
            6

        Tombstone ->
            7

        Other _ ->
            8


{-| Beads in board order: by status column, then priority (0 first), then id.
List view and kanban share it, so the selection index means the same bead in both.
-}
ordered : List Bead -> List Bead
ordered =
    List.sortBy (\b -> ( rank b.status, b.priority, b.id ))


{-| Kanban columns, one per status present, in board order. Beads inside a
column keep `ordered` order.
-}
columns : List Bead -> List ( String, List Bead )
columns beads =
    List.foldr
        (\b acc ->
            case acc of
                ( label, group ) :: rest ->
                    if label == statusLabel b.status then
                        ( label, b :: group ) :: rest

                    else
                        ( statusLabel b.status, [ b ] ) :: acc

                [] ->
                    [ ( statusLabel b.status, [ b ] ) ]
        )
        []
        (ordered beads)
