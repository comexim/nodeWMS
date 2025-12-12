import { FastifyRequest } from "fastify";
import { getProdData } from "../../services/automacao/getProdData";

export async function getProdDataController (req: FastifyRequest) {
    const { dataIni, dataFim, pilha } = req.query as { dataIni: string, dataFim: string, pilha: string };

    const response = await getProdData(dataIni, dataFim, pilha);
    return response;
}