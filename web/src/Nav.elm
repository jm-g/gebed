module Nav exposing (edge, order, section, sections, step)

{-| Moving the selection with h j k l. The selection is a bead id, so it
survives a reload and follows a card that changes column.
-}

import Agile
import Board
import Keys exposing (Dir(..), View(..))
import Timeline
import Types exposing (Bead)


{-| The beads in the order the view shows them, for j and k.
-}
order : Int -> View -> List Bead -> List Bead
order today view beads =
    case ( view, Agile.columnsFor today view beads ) of
        ( WaterfallView, _ ) ->
            Timeline.spans { offset = 0, now = 0 } beads |> List.map .bead

        ( _, Just cols ) ->
            List.concatMap .beads cols

        ( EpicsView, _ ) ->
            Agile.epicGroups beads |> List.concatMap (\g -> Maybe.map List.singleton g.epic |> Maybe.withDefault [] |> (\e -> e ++ g.children))

        ( MatrixView, _ ) ->
            List.concatMap (\p -> List.concatMap (\c -> Agile.matrixCell p c beads) (List.range 0 4)) (List.range 0 4)

        ( FlowView, _ ) ->
            []

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
            case Agile.columnsFor today view beads of
                Just cols ->
                    kanban dir id (List.map .beads cols)

                Nothing ->
                    case dir of
                        Up ->
                            index id flat |> Maybe.andThen (\i -> at (max 0 (i - 1)) flat) |> Maybe.map .id

                        Down ->
                            index id flat |> Maybe.andThen (\i -> at (min (List.length flat - 1) (i + 1)) flat) |> Maybe.map .id

                        _ ->
                            Just id


kanban : Dir -> String -> List (List Bead) -> Maybe String
kanban dir id cols =
    let
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


{-| The sections of a view, as vim's [[ and ]] see them: the columns of a board,
the status groups of the list, an epic with its children, a priority row of the
matrix; elsewhere blocks of ten rows. Empty sections are left out.
-}
sections : Int -> View -> List Bead -> List (List Bead)
sections today view beads =
    let
        flat =
            order today view beads

        chunks xs =
            if List.isEmpty xs then
                []

            else
                List.take 10 xs :: chunks (List.drop 10 xs)
    in
    (case ( Agile.columnsFor today view beads, view ) of
        ( Just cols, _ ) ->
            List.map .beads cols

        ( _, ListView ) ->
            List.map Tuple.second (Board.columns beads)

        ( _, EpicsView ) ->
            Agile.epicGroups beads |> List.map (\g -> (Maybe.map List.singleton g.epic |> Maybe.withDefault []) ++ g.children)

        ( _, MatrixView ) ->
            List.map (\p -> List.concatMap (\c -> Agile.matrixCell p c beads) (List.range 0 4)) (List.range 0 4)

        _ ->
            chunks flat
    )
        |> List.filter (not << List.isEmpty)


sectionOf : String -> List (List Bead) -> Maybe Int
sectionOf id secs =
    secs
        |> List.indexedMap (\i s -> ( i, List.any (\b -> b.id == id) s ))
        |> List.filter Tuple.second
        |> List.head
        |> Maybe.map Tuple.first


firstOf : Int -> List (List Bead) -> Maybe String
firstOf i secs =
    List.drop i secs |> List.head |> Maybe.andThen List.head |> Maybe.map .id


{-| [[ goes to the start of this section, or of the previous one when already
there; ]] goes to the start of the next. Nothing selected starts at the first
section.
-}
section : Int -> Maybe String -> List (List Bead) -> Maybe String
section dir sel secs =
    case sel |> Maybe.andThen (\id -> sectionOf id secs |> Maybe.map (\i -> ( id, i ))) of
        Nothing ->
            firstOf 0 secs

        Just ( id, i ) ->
            if dir < 0 then
                if firstOf i secs /= Just id then
                    firstOf i secs

                else
                    firstOf (max 0 (i - 1)) secs

            else
                firstOf (min (List.length secs - 1) (i + 1)) secs


{-| { and } go to the first and last bead of the current section.
-}
edge : Int -> Maybe String -> List (List Bead) -> Maybe String
edge dir sel secs =
    case sel |> Maybe.andThen (\id -> sectionOf id secs) |> Maybe.andThen (\i -> List.drop i secs |> List.head) of
        Nothing ->
            firstOf 0 secs

        Just s ->
            (if dir < 0 then
                List.head s

             else
                List.reverse s |> List.head
            )
                |> Maybe.map .id
