import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getToken } from "../services/getToken";


export async function TokenController(req: FastifyRequest, reply: FastifyReply) {
    const dados = req.body;
    const response = await getToken(dados);

    return reply.send(response);
}