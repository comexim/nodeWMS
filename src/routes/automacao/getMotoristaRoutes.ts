import { FastifyInstance } from "fastify";
import { getMotoristaController } from "../../controllers/automacao/getMotoristaController";
import { createRoute } from "../../utils/routerHelper";

export async function getMotoristaRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getMotorista", getMotoristaController, {},false);
}