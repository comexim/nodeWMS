import { FastifyReply, FastifyRequest } from "fastify";
import { updOpSeqValidation } from "../../middlewares/automacao/updOpSeqValidation";
import { updOpSeq } from "../../services/automacao/updOpSeq";

export async function updOpSeqController(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.query as { id: string };

    const validacao = await updOpSeqValidation(id);
    if(validacao) reply.status(401).send(validacao);

    const result = await updOpSeq(id);
    return result;
}