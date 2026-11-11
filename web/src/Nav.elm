module Nav exposing (order, step)

{-| Moving the selection with h j k l. The selection is a bead id, so it
survives a reload and follows a card that changes column.
-}

import Board
import Keys exposing (Dir(..), View(..))
import Schedule
import Types exposing (Bead)


{-| The beads in the order the view shows them, for j and k.
-}
order : Int -> View -> List Bead -> List Bead
order today view beads =
    case view of
        WaterfallView ->
            Schedule.spans today beads |> List.map .bead

        _ ->
            Board.ordered beads


at : Int -> List a -> Maybe a
at i xs =
    List.drop i xs |> List.head


index : String -> List Bead -> Maybe Int
index id beads =
    beads
        |> List.indexedMap Tuple.pair
        |> List.filter (\( _, b ) -> b.id == id)
        |> List.head
        |> Maybe.map Tuple.first


{-| The new selection after one step. With nothing selected the first bead in
view is selected.
-}
step : Int -> View -> Dir -> Maybe String -> List Bead -> Maybe String
step today view dir sel beads =
    let
        flat =
            order today view beads

        first =
            List.head flat |> Maybe.map .id
    in
    case sel |> Maybe.andThen (\id -> index id flat |> Maybe.map (\_ -> id)) of
        Nothing ->
            first

        Just id ->
            case view of
                KanbanView ->
                    kanban dir id beads

                _ ->
                    case dir of
                        Up ->
                            index id flat |> Maybe.andThen (\i -> at (max 0 (i - 1)) flat) |> Maybe.map .id

                        Down ->
                            index id flat |> Maybe.andThen (\i -> at (min (List.length flat - 1) (i + 1)) flat) |> Maybe.map .id

                        _ ->
                            Just id


kanban : Dir -> String -> List Bead -> Maybe String
kanban dir id beads =
    let
        cols =
            Board.columns beads |> List.map Tuple.second

        pos =
            cols
                |> List.indexedMap (\c col -> index id col |> Maybe.map (\r -> ( c, r )))
                |> List.filterMap identity
                |> List.head
    in
    case pos of
        Nothing ->
            Just id

        Just ( c, r ) ->
            case dir of
                Up ->
                    at (max 0 (r - 1)) (Maybe.withDefault [] (at c cols)) |> Maybe.map .id

                Down ->
                    let
                        col =
                            Maybe.withDefault [] (at c cols)
                    in
                    at (min (List.length col - 1) (r + 1)) col |> Maybe.map .id

                Left ->
                    sideways -1 c r cols |> Maybe.withDefault id |> Just

                Right ->
                    sideways 1 c r cols |> Maybe.withDefault id |> Just


{-| The bead in the nearest non-empty column on that side, at the same row or
the last one that column has.
-}
sideways : Int -> Int -> Int -> List (List Bead) -> Maybe String
sideways dx c r cols =
    case at (c + dx) cols of
        Nothing ->
            Nothing

        Just [] ->
            sideways dx (c + dx) r cols

        Just col ->
            at (min r (List.length col - 1)) col |> Maybe.map .id
