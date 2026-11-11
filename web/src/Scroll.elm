module Scroll exposing (Place(..), align, into)

{-| Scroll offsets for the selected card or row.
-}


{-| Where zt, zz and zb put the selection on the screen.
-}
type Place
    = AtTop
    | AtMiddle
    | AtBottom


{-| The scroll offset that shows an element. `scroll` is the current offset,
`pad` the height of something sticky on top that covers the first pixels,
`start` and `size` place the element inside the scrolled content, `view` is the
visible size and `margin` the air to keep around the element.
-}
into : Float -> Float -> Float -> Float -> Float -> Float -> Float
into scroll pad start size view margin =
    if start - margin < scroll + pad then
        max 0 (start - margin - pad)

    else if start + size + margin > scroll + view then
        start + size + margin - view

    else
        scroll


{-| The scroll offset that puts the element at the top, middle or bottom of the
visible area (below `pad`), as vim's zt, zz and zb do.
-}
align : Place -> Float -> Float -> Float -> Float -> Float
align place pad start size view =
    max 0
        (case place of
            AtTop ->
                start - pad

            AtMiddle ->
                start + size / 2 - (pad + view) / 2

            AtBottom ->
                start + size - view
        )
