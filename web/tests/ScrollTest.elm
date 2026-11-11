module ScrollTest exposing (suite)

import Expect
import Scroll
import Test exposing (Test, describe, test)


suite : Test
suite =
    describe "Scroll.into"
        [ test "an element already in view does not scroll" <|
            \_ -> Scroll.into 100 0 150 40 300 16 |> Expect.equal 100
        , test "an element below the fold scrolls down just enough, keeping the margin" <|
            \_ -> Scroll.into 0 0 400 40 300 16 |> Expect.equal 156
        , test "an element above scrolls up to it, keeping the margin" <|
            \_ -> Scroll.into 500 0 300 40 300 16 |> Expect.equal 284
        , test "never scrolls above the top" <|
            \_ -> Scroll.into 50 0 5 40 300 16 |> Expect.equal 0
        , test "a sticky header is not covered" <|
            \_ -> Scroll.into 100 46 120 30 300 16 |> Expect.equal 58
        ]
