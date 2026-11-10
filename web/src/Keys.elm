module Keys exposing
    ( Action(..)
    , ComposeKind(..)
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


type ComposeKind
    = NewBead
    | Discuss
    | Ask
    | Rename


type Action
    = Down
    | Up
    | Top
    | Bottom
    | Show View
    | NextTheme
    | Reload
    | Help
    | OpenDetail
    | Compose ComposeKind
    | SetStatus String
    | SetPriority Int
    | Reopen


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


leaf : String -> String -> Action -> Binding
leaf key label action =
    { key = key, label = label, entry = Do action }


group : String -> String -> List Binding -> Binding
group key label bindings =
    { key = key, label = label, entry = Prefix bindings }


root : List Binding
root =
    [ leaf "j" "down" Down
    , leaf "k" "up" Up
    , leaf "G" "bottom" Bottom
    , leaf "Enter" "open discussion" OpenDetail
    , leaf "c" "comment" (Compose Discuss)
    , leaf "a" "ask implementer" (Compose Ask)
    , leaf "n" "new bead" (Compose NewBead)
    , leaf "?" "help" Help
    , group "g" "go" [ leaf "g" "top" Top ]
    , group " "
        "leader"
        [ group "v"
            "view"
            [ leaf "l" "list" (Show ListView)
            , leaf "k" "kanban" (Show KanbanView)
            ]
        , group "e"
            "edit"
            [ group "s"
                "status"
                [ leaf "o" "open" (SetStatus "open")
                , leaf "p" "in progress" (SetStatus "in_progress")
                , leaf "b" "blocked" (SetStatus "blocked")
                , leaf "d" "deferred" (SetStatus "deferred")
                , leaf "c" "closed" (SetStatus "closed")
                ]
            , group "p"
                "priority"
                (List.map (\n -> leaf (String.fromInt n) ("P" ++ String.fromInt n) (SetPriority n)) [ 0, 1, 2, 3, 4 ])
            , leaf "o" "reopen" Reopen
            , leaf "t" "rename title" (Compose Rename)
            ]
        , group "t" "theme" [ leaf "n" "next theme" NextTheme ]
        , leaf "r" "reload" Reload
        ]
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
