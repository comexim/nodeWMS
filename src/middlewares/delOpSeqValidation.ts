import Retorno from "../models/Retorno";

export async function delOpSeqValidation (id: string): Promise<Retorno | null> {
    if(!id) return new Retorno ({code: 501, type: "Error", message: "Parâmetro id necessário!"});
    return null;
}