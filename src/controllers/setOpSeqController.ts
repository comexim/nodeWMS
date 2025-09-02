import { FastifyReply, FastifyRequest } from "fastify";
import WMS_SeqOpDTO from "../models/WMS_SeqOpDTO";
import { setOpSeq } from "../services/setOpSeq";

export async function setOpSeqController(req: FastifyRequest, reply: FastifyReply) {
    const dados = req.body as WMS_SeqOpDTO;

    const response = await setOpSeq(dados);

    return response;
}