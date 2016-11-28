module Main exposing (..)

import Html exposing (p, text, div, ul, li, h3, button, Html)
import Html.Attributes exposing (class, value)
import Html.Events exposing (onClick)
import Html.App exposing (..)
import Electron.IpcRenderer exposing (on, send)
import Mouse
import Keyboard
import Json.Decode exposing (Decoder, object1, string, (:=))
import Json.Encode
import String


main =
    Html.App.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Template =
    { name : String
    , path : String
    }


type alias Model =
    { clicks : Int
    , templates : List Template
    }


init : ( Model, Cmd Msg )
init =
    ( { clicks = 0, templates = [ { name = "Mix", path = "/Users/tcr/Desktop/test\\ Project/test.als" }, { name = "Mastering", path = "/tmp/mastering" } ] }, Cmd.none )


row : List (Html msg) -> Html msg
row elements =
    div [ class "row" ] elements


listTemplates : List Template -> Html Msg
listTemplates templates =
    ul [ class "list-group" ]
        (List.map
            (\t ->
                li [ class "list-group-item" ]
                    [ h3 [] [ text t.name ]
                    , button [ onClick (Open t.path) ] [ text "Open" ]
                    ]
            )
            templates
        )


view : Model -> Html Msg
view model =
    div [ class "container" ]
        [ row [ listTemplates model.templates ]
        ]


type alias Request =
    { action : String
    , args : List String
    }


type alias Reply =
    { action : String }


type Msg
    = OnIpc Reply
    | Open String


encodeRequest : Request -> Json.Encode.Value
encodeRequest request =
    Json.Encode.object
        [ ( "action", Json.Encode.string request.action )
        , ( "args", Json.Encode.list <| List.map (\t -> Json.Encode.string t) request.args )
        ]


decodeReply : Decoder Reply
decodeReply =
    object1 Reply
        ("action" := string)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        OnIpc r ->
            ( model, Cmd.none )

        Open filename ->
            ( model, send "asynchronous-message" <| encodeRequest { action = "open", args = [ filename ] } )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ on "asynchronous-reply" (Json.Decode.map OnIpc decodeReply)
        ]
