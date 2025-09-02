import { FastifyReply, FastifyRequest } from "fastify";
import { getApImas } from "../services/getApImas";

export async function getApImasController(req: FastifyRequest, reply: FastifyReply) {
    const { loteIni, dataIni, dataFim } = req.query as { loteIni: string, dataIni: string, dataFim: string};

    const response = await getApImas(loteIni, dataIni, dataFim);
    return response;
}