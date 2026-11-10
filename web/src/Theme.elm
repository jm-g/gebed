module Theme exposing (Scheme, decoder, vars)

import Dict exposing (Dict)
import Html
import Html.Attributes as A
import Json.Decode as D exposing (Decoder)


type alias Scheme =
    { name : String
    , system : String
    , variant : String
    , palette : Dict String String
    }


decoder : Decoder Scheme
decoder =
    D.map4 Scheme
        (D.field "name" D.string)
        (D.field "system" D.string)
        (D.field "variant" D.string)
        (D.field "palette" (D.dict D.string))


{-| One CSS custom property per palette entry (`--base00` ...), set on the root.
-}
vars : Scheme -> List (Html.Attribute msg)
vars s =
    Dict.toList s.palette |> List.map (\( k, v ) -> A.style ("--" ++ k) v)
