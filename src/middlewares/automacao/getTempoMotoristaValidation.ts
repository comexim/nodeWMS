import Retorno from "../../models/automacao/Retorno";

export async function getTempoMotoristaValidation (optck: string): Promise<Retorno | null> {
    if(!optck) return new Retorno ({ code: 401, message: "Campo optck necessário!"});
    return null;
}