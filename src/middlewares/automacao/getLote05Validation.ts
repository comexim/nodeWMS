import Retorno from "../../models/automacao/Retorno";

export async function getLote05Validation(lote: string): Promise<Retorno | null> {
    if(!lote) return new Retorno ({ code: 400, type: "Error", message: "Campo lote necessário!" });
    return null;
}