import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getEnderColorController } from "../../controllers/automacao/getEnderColorController";

export async function getEnderColorRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getEnderColor", getEnderColorController);
}