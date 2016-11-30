module Protocol exposing (..)

import Json.Encode
import Json.Decode
import Json.Decode exposing ((:=))
import Json.Decode.Extra as Extra exposing (withDefault, (|:))
import Model exposing (Template, decodeTemplate)


type alias Request =
    { action : String
    , args : List String
    }


emptyRequest : Request
emptyRequest =
    { action = ""
    , args = []
    }


encodeRequest : Request -> Json.Encode.Value
encodeRequest request =
    Json.Encode.object
        [ ( "action", Json.Encode.string request.action )
        , ( "args", Json.Encode.list <| List.map (\t -> Json.Encode.string t) request.args )
        ]


type alias Reply =
    { action : String }


emptyReply =
    { action = "" }


decodeReply : Json.Decode.Decoder Reply
decodeReply =
    Json.Decode.object1 Reply
        ("status" := Json.Decode.string)


type alias ListReply =
    { action : String
    , status : String
    , data : List Template
    , err : String
    , err_msg : String
    }


decodeListReply : Json.Decode.Decoder ListReply
decodeListReply =
    Json.Decode.succeed ListReply
        |: ("action" := Json.Decode.string |> withDefault "default action")
        |: ("status" := Json.Decode.string |> withDefault "default status")
        |: ("data" := Json.Decode.list decodeTemplate)
        |: ("err" := Json.Decode.string |> withDefault "")
        |: ("err_msg" := Json.Decode.string |> withDefault "")
