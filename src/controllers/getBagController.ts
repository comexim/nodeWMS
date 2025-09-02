import { FastifyReply, FastifyRequest } from "fastify";
import { getBagValidation } from "../middlewares/getBagValidation";
import { getBag2 } from "../services/getBag";

export async function getBagController (req: FastifyRequest, reply: FastifyReply) {
    const { tagbag } = req.query as { tagbag: string };

    const validacao = await getBagValidation(tagbag);
    if (validacao) return reply.status(400).send(validacao);

    const response = await getBag2(tagbag);

    return response;
}