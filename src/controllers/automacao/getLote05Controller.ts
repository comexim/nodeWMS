import { FastifyReply, FastifyRequest } from "fastify";
import { getLote05Validation } from "../../middlewares/automacao/getLote05Validation";
import { getLote05 } from "../../services/automacao/getLote05";

export async function getLote05Controller(req: FastifyRequest, reply: FastifyReply) {
    const { lote } = req.query as { lote: string };

    const validacao = await getLote05Validation(lote);
    if(validacao) return reply.status(400).send(validacao);

    const result = await getLote05(lote);
    return result;
}