import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getSiloAppController } from "../../controllers/automacao/getSiloAppController";

export async function getSiloAppRoutes (app: FastifyInstance) { 
    createRoute(app, "get", "/api_wms/getSiloApp", getSiloAppController);
}