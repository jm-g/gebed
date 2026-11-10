module Keys exposing
    ( Action(..)
    , Outcome(..)
    , View(..)
    , hints
    , press
    )

{-| The key tree is data: one table drives both dispatch and the which-key popup.
-}


type View
    = ListView
    | KanbanView


type Action
    = Down
    | Up
    | Top
    | Bottom
    | Show View
    | NextTheme
    | Reload
    | Help


type Entry
    = Do Action
    | Prefix (List Binding)


type alias Binding =
    { key : String
    , label : String
    , entry : Entry
    }


type Outcome
    = Run Action
    | Wait (List String)
    | Cancel


root : List Binding
root =
    [ { key = "j", label = "down", entry = Do Down }
    , { key = "k", label = "up", entry = Do Up }
    , { key = "G", label = "bottom", entry = Do Bottom }
    , { key = "?", label = "help", entry = Do Help }
    , { key = "g"
      , label = "go"
      , entry = Prefix [ { key = "g", label = "top", entry = Do Top } ]
      }
    , { key = " "
      , label = "leader"
      , entry =
            Prefix
                [ { key = "v"
                  , label = "view"
                  , entry =
                        Prefix
                            [ { key = "l", label = "list", entry = Do (Show ListView) }
                            , { key = "k", label = "kanban", entry = Do (Show KanbanView) }
                            ]
                  }
                , { key = "t"
                  , label = "theme"
                  , entry = Prefix [ { key = "n", label = "next theme", entry = Do NextTheme } ]
                  }
                , { key = "r", label = "reload", entry = Do Reload }
                ]
      }
    ]


bindingsAt : List String -> Maybe (List Binding)
bindingsAt path =
    List.foldl
        (\k acc ->
            case acc of
                Nothing ->
                    Nothing

                Just bs ->
                    case List.filter (\b -> b.key == k) bs of
                        { entry } :: _ ->
                            case entry of
                                Prefix next ->
                                    Just next

                                Do _ ->
                                    Nothing

                        [] ->
                            Nothing
        )
        (Just root)
        path


{-| What a key does after the keys already pressed (`pending`, oldest first).
Escape or an unbound key cancels the sequence.
-}
press : List String -> String -> Outcome
press pending key =
    case ( key, bindingsAt pending ) of
        ( "Escape", _ ) ->
            Cancel

        ( _, Nothing ) ->
            Cancel

        ( _, Just bs ) ->
            case List.filter (\b -> b.key == key) bs of
                { entry } :: _ ->
                    case entry of
                        Do a ->
                            Run a

                        Prefix _ ->
                            Wait (pending ++ [ key ])

                [] ->
                    Cancel


{-| The which-key popup rows (key, label) for a pending sequence.
-}
hints : List String -> List ( String, String )
hints pending =
    bindingsAt pending
        |> Maybe.withDefault []
        |> List.map (\b -> ( keyName b.key, b.label ++ prefixMark b.entry ))


keyName : String -> String
keyName k =
    if k == " " then
        "SPC"

    else
        k


prefixMark : Entry -> String
prefixMark e =
    case e of
        Prefix _ ->
            " …"

        Do _ ->
            ""
