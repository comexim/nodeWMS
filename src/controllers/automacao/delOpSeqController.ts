import { FastifyReply, FastifyRequest } from "fastify";
import { delOpSeqValidation } from "../../middlewares/automacao/delOpSeqValidation";
import { delOpSeq } from "../../services/automacao/delOpSeq";

export async function delOpSeqController(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.query as { id: string };

    const validacao = await delOpSeqValidation(id);
    if(validacao) reply.status(401).send(validacao);

    const result = await delOpSeq(id);

    return result;
}