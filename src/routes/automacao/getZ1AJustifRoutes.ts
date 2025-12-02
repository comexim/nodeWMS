import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getZ1AJustifController } from "../../controllers/automacao/getZ1AJustifController";

export async function getZ1AJustifRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getZ1AJustif", getZ1AJustifController);
}