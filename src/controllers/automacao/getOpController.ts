import { FastifyReply, FastifyRequest } from "fastify";
import { getOpValidation } from "../../middlewares/automacao/getOpValidation";
import { getOP } from "../../services/automacao/getOP";

export async function getOpController (req: FastifyRequest, reply: FastifyReply) {
    const { numOP } = req.query as { numOP: string };

    const validation = await getOpValidation(numOP);
    if(validation) return reply.status(400).send(validation);

    const result = await getOP(numOP);
    return result;
}