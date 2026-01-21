import { FastifyRequest } from "fastify";
import WMS_OSInsert from "../../models/automacao/WMS_OSInsert";
import { insOrdemServicoLote } from "../../services/automacao/insOrdemServicoLote";

export async function insOrdemServicoLoteController (req: FastifyRequest)
{
    const {dados} = req.body as {dados: WMS_OSInsert};

    const response = await insOrdemServicoLote(dados);
    return response;
}