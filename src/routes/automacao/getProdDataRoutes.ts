import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getProdDataController } from "../../controllers/automacao/getProdDataController";

export async function getProdDataRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getProdData", getProdDataController);
}