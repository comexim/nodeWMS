import { FastifyRequest } from "fastify";
import { getEnderColor } from "../../services/automacao/getEnderColor";

export async function getEnderColorController (req: FastifyRequest) {
    const params = req.query as {op: string, lote: string, linha: string, graudo: string, mtgb: string, grinder: string, pva: string, safra: string, endereco: string, tagBag: string};

    const response = await getEnderColor(params);
    return response;
}