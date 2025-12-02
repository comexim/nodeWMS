import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getSiloWMSSUPController } from "../../controllers/automacao/getSiloWMSSUP";

export async function getSiloWMSSUPRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getSiloWMSSUP", getSiloWMSSUPController);
}