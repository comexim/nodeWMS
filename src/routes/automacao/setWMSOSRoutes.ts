import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { setWMSOSController } from "../../controllers/automacao/setWMSOSController";

export async function setWMSOSRoutes (app: FastifyInstance) {
    createRoute(app, "post", "/api_wms/setWMSOS", setWMSOSController);
}