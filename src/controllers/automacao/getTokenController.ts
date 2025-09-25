import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getToken } from "../../services/automacao/getToken";


export async function TokenController(req: FastifyRequest, reply: FastifyReply) {
    const dados = req.body;
    const response = await getToken(dados);

    return reply.send(response);
}