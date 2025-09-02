import { FastifyReply, FastifyRequest } from "fastify";
import { getLoteApontValidation } from "../middlewares/getLoteApontValidation";
import { getLoteApont } from "../services/getLoteApont";

export async function getLoteApontController(req: FastifyRequest, reply: FastifyReply) { 
    const { lote, equipto } = req.query as { lote: string, equipto: string };
    
    const validacao = await getLoteApontValidation(lote, equipto);
    if(validacao) return reply.status(401).send(validacao);

    const result = await getLoteApont(lote, equipto);
    return result;
}