import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { setDespejoProdController } from "../../controllers/automacao/setDespejoProdController";

export async function setDespejoProdRoutes (app: FastifyInstance) {
    createRoute(app, "post", "/api_wms/setDespejoProd", setDespejoProdController);
}