import { FastifyReply, FastifyRequest } from "fastify";
import WMS_SeqOpDTO from "../../models/automacao/WMS_SeqOpDTO";
import { setOpSeq } from "../../services/automacao/setOpSeq";

export async function setOpSeqController(req: FastifyRequest, reply: FastifyReply) {
    const dados = req.body as WMS_SeqOpDTO;

    const response = await setOpSeq(dados);

    return response;
}