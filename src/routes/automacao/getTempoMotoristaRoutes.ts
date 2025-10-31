import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getTempoMotoristaController } from "../../controllers/automacao/getTempoMotoristaController";

export async function getTempoMotoristaRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getTempoMotorista", getTempoMotoristaController);
}