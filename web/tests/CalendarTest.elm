module CalendarTest exposing (suite)

import Calendar
import Expect
import Test exposing (Test, describe, test)


suite : Test
suite =
    describe "Calendar"
        [ test "the epoch" <|
            \_ -> Calendar.fromYmd 1970 1 1 |> Expect.equal 0
        , test "known days" <|
            \_ ->
                [ Calendar.fromYmd 2000 1 1, Calendar.fromYmd 2000 3 1, Calendar.fromYmd 2026 11 20 ]
                    |> Expect.equal [ 10957, 11017, 20777 ]
        , test "iso round trip across leap days and year ends" <|
            \_ ->
                [ "2000-02-29", "2024-02-29", "2026-12-31", "2027-01-01", "2100-03-01" ]
                    |> List.map (\s -> Calendar.fromIso s |> Maybe.map Calendar.toIso)
                    |> Expect.equal (List.map Just [ "2000-02-29", "2024-02-29", "2026-12-31", "2027-01-01", "2100-03-01" ])
        , test "a day that does not exist is rejected" <|
            \_ ->
                [ "2026-02-30", "2025-02-29", "2026-13-01", "2026-00-10", "nope", "", "2026-11" ]
                    |> List.map Calendar.fromIso
                    |> Expect.equal (List.repeat 7 Nothing)
        , test "consecutive days differ by one across a month end" <|
            \_ ->
                Maybe.map2 (-) (Calendar.fromIso "2026-12-01") (Calendar.fromIso "2026-11-30")
                    |> Expect.equal (Just 1)
        , test "weekend: 2026-11-21 is a Saturday, 2026-11-23 a Monday" <|
            \_ ->
                [ "2026-11-21", "2026-11-22", "2026-11-23" ]
                    |> List.map (\s -> Calendar.fromIso s |> Maybe.map Calendar.weekend)
                    |> Expect.equal [ Just True, Just True, Just False ]
        ]
