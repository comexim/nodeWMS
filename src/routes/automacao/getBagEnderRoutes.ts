import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getBagEnderController } from "../../controllers/automacao/getBagEnderController";

export async function getBagEnderRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getBagEnder", getBagEnderController);
}