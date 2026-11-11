module NavTest exposing (suite)

import Expect
import Keys exposing (Dir(..), View(..))
import Nav
import Test exposing (Test, describe, test)
import Types exposing (Bead, Status(..))


bead : String -> Status -> Int -> Bead
bead id status prio =
    { id = id
    , title = id
    , description = ""
    , status = status
    , kind = "task"
    , priority = prio
    , assignee = ""
    , owner = ""
    , labels = []
    , depCount = 0
    , dependentCount = 0
    , deps = []
    , due = ""
    , estDays = 0
    , createdMs = 0
    , updatedMs = 0
    , closedMs = Nothing
    }


{-| open: a1 a2 · in\_progress: (none) · blocked: c1 · closed: d1
-}
beads : List Bead
beads =
    [ bead "a2" Open 2, bead "a1" Open 1, bead "c1" Blocked 1, bead "d1" Closed 1 ]


go : View -> Dir -> Maybe String -> Maybe String
go view dir sel =
    Nav.step 0 view dir sel beads


suite : Test
suite =
    describe "Nav"
        [ test "nothing selected selects the first bead in view" <|
            \_ -> go KanbanView Down Nothing |> Expect.equal (Just "a1")
        , test "j and k walk down and up a column and stop at the ends" <|
            \_ ->
                [ go KanbanView Down (Just "a1"), go KanbanView Down (Just "a2"), go KanbanView Up (Just "a1") ]
                    |> Expect.equal [ Just "a2", Just "a2", Just "a1" ]
        , test "l skips the empty in_progress column" <|
            \_ -> go KanbanView Right (Just "a1") |> Expect.equal (Just "c1")
        , test "h goes back over the empty column" <|
            \_ -> go KanbanView Left (Just "c1") |> Expect.equal (Just "a1")
        , test "sideways keeps the row, or the last row of a shorter column" <|
            \_ -> go KanbanView Right (Just "a2") |> Expect.equal (Just "c1")
        , test "h at the first column and l at the last stay put" <|
            \_ ->
                [ go KanbanView Left (Just "a1"), go KanbanView Right (Just "d1") ]
                    |> Expect.equal [ Just "a1", Just "d1" ]
        , test "a selection that is gone falls back to the first bead" <|
            \_ -> go KanbanView Down (Just "gone") |> Expect.equal (Just "a1")
        , test "list view walks board order" <|
            \_ ->
                [ go ListView Down (Just "a1"), go ListView Down (Just "a2"), go ListView Down (Just "c1") ]
                    |> Expect.equal [ Just "a2", Just "c1", Just "d1" ]
        , test "h and l do nothing in the list" <|
            \_ -> go ListView Right (Just "a1") |> Expect.equal (Just "a1")
        ]
