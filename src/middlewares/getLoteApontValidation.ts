import Retorno from "../models/Retorno";

export async function getLoteApontValidation(lote: string, apEquipto: string): Promise<Retorno | null> {
    if(!lote) return new Retorno ({ code: 401, type: "Error", message: "Campo lote incompleto ou mal escrito!"});
    if(!apEquipto) return new Retorno ({ code: 401, type: "Error", message: "Campo Equipamento necessário!"});
    return null;
}