import Retorno from "../../models/automacao/Retorno";

export async function updOpSeqValidation(id: string): Promise<Retorno | null> {
    if(!id) return new Retorno ({ code: 500, type: "Error", message: "Parâmetro id necessário!"});
    return null;
}