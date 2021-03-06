module Main exposing (..)

import Html exposing (Html, program, div, text, button, h4, ul, li)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Electron.IpcRenderer exposing (on, send)
import String
import Protocol exposing (..)
import Model exposing (..)
import Json.Decode
import Bootstrap exposing (row, navbar, navbarBrand)


main =
    program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { clicks : Int
    , templates : List Template
    }


init : ( Model, Cmd Msg )
init =
    let
        model =
            { clicks = 0, templates = [] }
    in
        model
            ! [ send "list-request" <| encodeRequest { action = "list", args = [] } ]


listTemplates : List Template -> Html Msg
listTemplates templates =
    ul [ class "list-group" ]
        (List.map
            (\t ->
                li [ class "list-group-item" ]
                    [ h4 [] [ text t.name ]
                    , button [ class "btn btn-default btn-lg btn-block", onClick (Open t.path) ] [ text "Open" ]
                    , button [ class "btn btn-default btn-lg btn-block", onClick (CreateLiveSetFrom t) ] [ text "Use" ]
                    , button [ class "btn btn-default btn-lg btn-block", onClick (CreateTemplateFrom t) ] [ text "Fork" ]
                    ]
            )
            templates
        )


view : Model -> Html Msg
view model =
    div [ class "container" ]
        [ navbar []
            [ navbarBrand [] [ text "patron" ]
            ]
        , row [ listTemplates model.templates ]
        ]


type Msg
    = OnReply Reply
    | OnListReply ListReply
    | OnCreateTemplateReply ListReply
    | Open String
    | CreateLiveSetFrom Template
    | CreateTemplateFrom Template


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        OnReply r ->
            ( model, Cmd.none )

        OnListReply lr ->
            ( { model | templates = lr.data }, Cmd.none )

        OnCreateTemplateReply lr ->
            ( { model | templates = List.append model.templates lr.data }, Cmd.none )

        Open filename ->
            ( model, send "open-request" <| encodeRequest { action = "open", args = [ filename ] } )

        CreateLiveSetFrom t ->
            ( model, send "create-live-set-request" <| encodeRequest { action = "create-live-set", args = [ t.path ] } )

        CreateTemplateFrom t ->
            ( model, send "create-template-request" <| encodeRequest { action = "create-template", args = [ t.name, t.path ] } )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ on "open-reply" (Json.Decode.map OnReply decodeReply)
        , on "list-reply" (Json.Decode.map OnListReply decodeListReply)
        , on "create-template-reply" (Json.Decode.map OnCreateTemplateReply decodeListReply)
        ]
