module Protocol exposing (..)

import Json.Encode
import Json.Decode
import Json.Decode.Pipeline exposing (decode, required, optional, hardcoded)
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
    decode Reply
        |> required "status" Json.Decode.string


type alias ListReply =
    { action : String
    , status : String
    , data : List Template
    , err : String
    , err_msg : String
    }


decodeListReply : Json.Decode.Decoder ListReply
decodeListReply =
    decode ListReply
        |> optional "action" Json.Decode.string "default action"
        |> optional "status" Json.Decode.string "default status"
        |> required "data" (Json.Decode.list decodeTemplate)
        |> optional "err" Json.Decode.string ""
        |> optional "err_msg" Json.Decode.string ""
