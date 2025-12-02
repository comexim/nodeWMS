import { FastifyRequest } from "fastify";
import { getOrdemEnder } from "../../services/automacao/getOrdemEnder";

export async function getOrdemEnderController (req: FastifyRequest) {
    const params = req.query as {osid: string, optck: string, osItem: string, login: string, status: string, prioridade: string, origem: string, destino: string, lote: string, empilhadeira: string, salto: string, regPPagina: string, dataIni: string, dataFim: string, tagBag: string, osStatus: string};

    const response = await getOrdemEnder(params);
    return response;
}