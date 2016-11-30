module Bootstrap exposing (..)

import Html exposing (div, nav, a, img, Html, Attribute)
import Html.Attributes exposing (class, alt, src)


row : List (Html msg) -> Html msg
row elements =
    div [ class "row" ] elements


navbar : List (Attribute msg) -> List (Html msg) -> Html msg
navbar attributes elements =
    nav (List.append [ class "navbar navbar-default navbar-fixed-top" ] attributes)
        [ div [ class "container" ]
            [ div [ class "navbar-header" ] elements
            ]
        ]


navbarBrand : List (Attribute msg) -> List (Html msg) -> Html msg
navbarBrand attributes elements =
    a (List.append [ class "navbar-brand" ] attributes) elements
