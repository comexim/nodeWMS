import { FastifyRequest } from "fastify";
import WMS_OPMoegaInsert from "../../models/automacao/WMS_OPMoegaInsert";
import { setDespejoProd } from "../../services/automacao/setDespejoProd";

export async function setDespejoProdController (req: FastifyRequest) {
    const params = req.body as WMS_OPMoegaInsert;

    const response = await setDespejoProd(params);
    return response;
}