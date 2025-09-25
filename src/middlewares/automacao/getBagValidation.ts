import Retorno from "../../models/automacao/Retorno";

export async function getBagValidation (tagbag: string): Promise<Retorno | null> {
    if (!tagbag) return new Retorno ({code: 401, type: "Error", message: "Parâmetro tag é obrigatório!"})
    return null
}