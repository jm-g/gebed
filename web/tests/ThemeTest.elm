module ThemeTest exposing (suite)

import Dict
import Expect
import Test exposing (Test, describe, test)
import Theme exposing (Scheme)


scheme : String -> String -> Scheme
scheme system name =
    { name = name, system = system, variant = "dark", palette = Dict.empty }


suite : Test
suite =
    describe "Theme"
        [ test "the app starts on base16 Catppuccin Macchiato" <|
            \_ ->
                Theme.defaultIndex [ scheme "base16" "3024", scheme "base24" "Catppuccin Macchiato", scheme "base16" "Catppuccin Macchiato" ]
                    |> Expect.equal 2
        , test "falls back to the first theme when Macchiato is not loaded" <|
            \_ ->
                Theme.defaultIndex [ scheme "base16" "3024" ]
                    |> Expect.equal 0
        ]
