module Main exposing (main)

import Browser
import Html exposing (Html, text)


main : Program () () ()
main =
    Browser.sandbox { init = (), update = \_ m -> m, view = view }


view : () -> Html ()
view _ =
    text "gebed"
