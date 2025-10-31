import { FastifyRequest } from "fastify";
import { getProdParada } from "../../services/automacao/getProdParada";

export async function getProdParadaController (req: FastifyRequest) {
    const { op, maqCod, dataIni, dataFim, usuario } = req.query as { op: string, maqCod: string, dataIni: string, dataFim: string, usuario: string};

    const response = await getProdParada(op, maqCod, dataIni, dataFim, usuario);
    return response;
}