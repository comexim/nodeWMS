import { FastifyReply, FastifyRequest } from "fastify";
import { getContasPagas } from "../../services/protheus/getContasPagasProtheus";

export async function getContasPagasProtheusController (req: FastifyRequest, reply: FastifyReply) {
    const { dataIni, dataFim } = req.query as { dataIni: string, dataFim: string };

    const response = await getContasPagas(dataIni, dataFim);
    return response;
}