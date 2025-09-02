import { FastifyReply, FastifyRequest } from "fastify";
import { getMovEnderValidation } from "../middlewares/getMovEnderValidation";
import { getMovEnder } from "../services/getMovEnder";

export async function getMovEnderController (req: FastifyRequest, reply: FastifyReply) {
    const { dataIni, dataFim, tipo, usuario } = req.query as {dataIni: string, dataFim: string, tipo: string, usuario: string};

    const validacao = getMovEnderValidation(dataIni, dataFim, tipo, usuario);
    if(validacao) return reply.status(400).send(validacao);

    const result = await getMovEnder(dataIni, dataFim, tipo, usuario);
    return reply.send(result);
}