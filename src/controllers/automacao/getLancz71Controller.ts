import { FastifyReply, FastifyRequest } from "fastify";
import { getLancz71 } from "../../services/automacao/getLancz71";

export async function getLancz71Controller (req: FastifyRequest, reply: FastifyReply) {
    const { _SeqOpId, _NumOP, _Setor, _Tipo, _Chv, _OpTck} = req.query as { _SeqOpId: string, _NumOP: string, _Setor: string, _Tipo: string, _Chv: string, _OpTck: string};

    const result = await getLancz71(_SeqOpId, _NumOP, _Setor, _Tipo, _Chv, _OpTck);

    return result;
}