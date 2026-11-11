module Scroll exposing (into)

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
