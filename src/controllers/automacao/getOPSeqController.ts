import { FastifyReply, FastifyRequest } from "fastify";
import { getOPSeq } from "../../services/automacao/getOPSeq";

export async function getOPSeqController(req: FastifyRequest, reply: FastifyReply) {
    const { _id, _local } = req.query as { _id: number, _local: string};

    const result = await getOPSeq(_id, _local);

    return result;
}