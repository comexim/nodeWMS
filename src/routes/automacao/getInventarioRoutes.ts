import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getInventarioController } from "../../controllers/automacao/getInventarioController";

export async function getInventarioRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getInventario", getInventarioController);
}