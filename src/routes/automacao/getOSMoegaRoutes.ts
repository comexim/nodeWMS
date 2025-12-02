import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getOSMoegaController } from "../../controllers/automacao/getOSMoegaController";

export async function getOSMoegaRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getOSMoega", getOSMoegaController);
}