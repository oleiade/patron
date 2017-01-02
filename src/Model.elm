module Model exposing (..)

import Json.Encode
import Json.Decode
import Json.Decode.Pipeline exposing (decode, required, optional, hardcoded)


type alias Template =
    { name : String
    , path : String
    }


encodeTemplate : Template -> Json.Encode.Value
encodeTemplate template =
    Json.Encode.object
        [ ( "name", Json.Encode.string template.name )
        , ( "path", Json.Encode.string template.path )
        ]


decodeTemplate : Json.Decode.Decoder Template
decodeTemplate =
    Json.Decode.succeed Template
        |> optional "name" Json.Decode.string "default name"
        |> optional "path" Json.Decode.string "default path"
