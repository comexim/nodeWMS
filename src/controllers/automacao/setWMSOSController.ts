import { FastifyRequest } from "fastify";
import WMS_OSInsert from "../../models/automacao/WMS_OSInsert";

export async function setWMSOSController (req: FastifyRequest) {
    const body = req.body as WMS_OSInsert;

    const response = await 
}