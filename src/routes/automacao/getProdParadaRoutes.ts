import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getProdParadaController } from "../../controllers/automacao/getProdParadaController";

export async function getProdParadaRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getProdParada", getProdParadaController);
}