module Calendar exposing (Civil, civil, dayOfMonth, fromIso, fromYmd, monthName, toIso, weekend)

{-| Calendar days as whole numbers since 1970-01-01, in the user's zone, with
no time of day. The conversions are Howard Hinnant's civil-date algorithms.
-}


type alias Civil =
    { year : Int
    , month : Int
    , day : Int
    }


fromYmd : Int -> Int -> Int -> Int
fromYmd y0 m d =
    let
        y =
            if m <= 2 then
                y0 - 1

            else
                y0

        era =
            (if y >= 0 then
                y

             else
                y - 399
            )
                // 400

        yoe =
            y - era * 400

        doy =
            (153
                * (if m > 2 then
                    m - 3

                   else
                    m + 9
                  )
                + 2
            )
                // 5
                + d
                - 1

        doe =
            yoe * 365 + yoe // 4 - yoe // 100 + doy
    in
    era * 146097 + doe - 719468


civil : Int -> Civil
civil days =
    let
        z =
            days + 719468

        era =
            (if z >= 0 then
                z

             else
                z - 146096
            )
                // 146097

        doe =
            z - era * 146097

        yoe =
            (doe - doe // 1460 + doe // 36524 - doe // 146096) // 365

        doy =
            doe - (365 * yoe + yoe // 4 - yoe // 100)

        mp =
            (5 * doy + 2) // 153

        d =
            doy - (153 * mp + 2) // 5 + 1

        m =
            if mp < 10 then
                mp + 3

            else
                mp - 9

        y =
            yoe
                + era
                * 400
                + (if m <= 2 then
                    1

                   else
                    0
                  )
    in
    { year = y, month = m, day = d }


pad : Int -> String
pad n =
    String.padLeft 2 '0' (String.fromInt n)


toIso : Int -> String
toIso days =
    let
        c =
            civil days
    in
    String.fromInt c.year ++ "-" ++ pad c.month ++ "-" ++ pad c.day


{-| Parses YYYY-MM-DD; a day that does not exist (2026-02-30) is Nothing.
-}
fromIso : String -> Maybe Int
fromIso s =
    case List.map String.toInt (String.split "-" s) of
        [ Just y, Just m, Just d ] ->
            if m >= 1 && m <= 12 && d >= 1 then
                let
                    n =
                        fromYmd y m d
                in
                if civil n == { year = y, month = m, day = d } then
                    Just n

                else
                    Nothing

            else
                Nothing

        _ ->
            Nothing


dayOfMonth : Int -> Int
dayOfMonth days =
    (civil days).day


monthName : Int -> String
monthName m =
    case m of
        1 ->
            "Jan"

        2 ->
            "Feb"

        3 ->
            "Mar"

        4 ->
            "Apr"

        5 ->
            "May"

        6 ->
            "Jun"

        7 ->
            "Jul"

        8 ->
            "Aug"

        9 ->
            "Sep"

        10 ->
            "Oct"

        11 ->
            "Nov"

        _ ->
            "Dec"


{-| Saturday or Sunday. 1970-01-01 was a Thursday.
-}
weekend : Int -> Bool
weekend days =
    List.member (modBy 7 (days + 4)) [ 0, 6 ]
