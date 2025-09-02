import { FastifyReply, FastifyRequest } from "fastify";
import { getZ71Prod } from "../services/getZ71Prod";

export async function getz71ProdController (req: FastifyRequest, reply: FastifyReply) {
    const { lote, setor, opticket, optck, recno } = req.query as { lote: string, setor: string, opticket: string, optck: string, recno: string }

    const result = await getZ71Prod(lote,setor,opticket,optck,recno);

    return result;
}