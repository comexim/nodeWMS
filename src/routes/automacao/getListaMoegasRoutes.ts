import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getListaMoegasController } from "../../controllers/automacao/getListaMoegasController";

export async function getListaMoegasRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getListaMoegas", getListaMoegasController);
}