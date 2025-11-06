import { FastifyRequest } from "fastify";
import { getListaBag } from "../../services/automacao/getListaBag";

export async function getListaBagController (req: FastifyRequest) {
    const { lote, tagBag } = req.query as { lote: string, tagBag: string };
    const result = await getListaBag(lote, tagBag);
    return result;
}