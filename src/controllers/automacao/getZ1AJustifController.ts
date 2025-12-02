import { FastifyRequest } from "fastify";
import { getZ1AJustif } from "../../services/automacao/getZ1AJustif";

export async function getZ1AJustifController (req: FastifyRequest) {
    const { ticket, dataIni, dataFim, usuario } = req.query as { ticket: string, dataIni: string, dataFim: string, usuario: string }

    const response = await getZ1AJustif(ticket, dataIni, dataFim, usuario);
    return response;
}