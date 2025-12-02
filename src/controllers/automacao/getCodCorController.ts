import { FastifyRequest } from "fastify";
import { getCodCor } from "../../services/automacao/getCodCor";

export async function getCodCorController (req: FastifyRequest) {
    const { filial, nContrato, cVenda } = req.query as { filial: string, nContrato: string, cVenda: string };

    const result = await getCodCor(filial, nContrato, cVenda);
    return result;
}