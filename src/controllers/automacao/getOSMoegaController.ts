import { FastifyRequest } from "fastify";
import { getOSMoega } from "../../services/automacao/getOSMoega";

export async function getOSMoegaController (req: FastifyRequest) {
    const moega = req.query as {moega: string};

    const response = await getOSMoega(moega);
    return response;
}