import Retorno from "../../models/automacao/Retorno";

export async function getOpValidation(numOP: string): Promise<Retorno | null> {
    if(!numOP) return new Retorno ({code: 501, type: "Error", message: "Parâmetro numOP é necessário!"});
    return null;
}