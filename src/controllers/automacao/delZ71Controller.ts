import { FastifyReply, FastifyRequest } from "fastify";
import { delZ71 } from "../../services/automacao/delZ71";

export async function delZ71Controller (req: FastifyRequest, reply: FastifyReply) {
    const { _Recno } = req.query as { _Recno: number};

    const response = await delZ71(_Recno);

    return response;
}