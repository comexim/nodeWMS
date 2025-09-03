import Retorno from "../models/Retorno";

export async function delEtiquetaValidation(bagTag:String, bagLote:String):Promise<Retorno|null> {
    if(!bagTag || !bagLote) {
        new Retorno({code:500, type:"Error",message:"Tag do bag e numero do lote são obrigatórios para essa API! Verifique!"})
    }
    return null
}
