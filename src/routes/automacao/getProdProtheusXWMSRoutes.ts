import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getProdProtheusXWMSController } from "../../controllers/automacao/getProdProtheusXWMSController";

export async function getProdProtheusXWMSRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getProdProtheusXWMS", getProdProtheusXWMSController);
}