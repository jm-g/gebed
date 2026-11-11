module Theme exposing (Scheme, css, decoder, defaultIndex, search)

import Dict exposing (Dict)
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


{-| The index of the scheme the app starts with: base16 Catppuccin Macchiato.
Index 0 when it is not loaded.
-}
defaultIndex : List Scheme -> Int
defaultIndex schemes =
    schemes
        |> List.indexedMap Tuple.pair
        |> List.filter (\( _, s ) -> s.system == "base16" && s.name == "Catppuccin Macchiato")
        |> List.head
        |> Maybe.map Tuple.first
        |> Maybe.withDefault 0


{-| A `:root` rule with one CSS custom property per palette entry (`--base00` ...).
It must be on `:root`, not on one element: body and the page use the palette too.
-}
css : Scheme -> String
css s =
    ":root{" ++ String.concat (List.map (\( k, v ) -> "--" ++ k ++ ":" ++ v ++ ";") (Dict.toList s.palette)) ++ "}"


{-| Indexes of the schemes whose name, variant and system hold the letters of
the query in order, ignoring case and spaces.
-}
search : String -> List Scheme -> List Int
search query schemes =
    let
        want =
            String.toList (String.toLower (String.filter (\c -> c /= ' ') query))
    in
    List.indexedMap Tuple.pair schemes
        |> List.filter (\( _, s ) -> inOrder want (String.toList (String.toLower (s.name ++ s.variant ++ s.system))))
        |> List.map Tuple.first


inOrder : List Char -> List Char -> Bool
inOrder want text =
    case ( want, text ) of
        ( [], _ ) ->
            True

        ( _, [] ) ->
            False

        ( w :: ws, t :: ts ) ->
            if w == t then
                inOrder ws ts

            else
                inOrder want ts
