import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getListaBagController } from "../../controllers/automacao/getListaBagController";

export async function getListaBagRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getListaBag", getListaBagController);
}