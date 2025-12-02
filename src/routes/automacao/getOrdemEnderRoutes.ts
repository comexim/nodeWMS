import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getOrdemEnderController } from "../../controllers/automacao/getOrdemEnderController";

export async function getOrdemEnderRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getOE", getOrdemEnderController);
}