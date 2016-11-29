module Model exposing (..)

import Json.Decode
import Json.Decode exposing ((:=))
import Json.Decode.Extra as Extra exposing (withDefault, (|:))


type alias Template =
    { name : String
    , path : String
    }


decodeTemplate : Json.Decode.Decoder Template
decodeTemplate =
    Json.Decode.succeed Template
        |: ("name" := Json.Decode.string |> withDefault "default name")
        |: ("path" := Json.Decode.string |> withDefault "default path")
