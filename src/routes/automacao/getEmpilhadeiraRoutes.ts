import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getEmpilhadeiraController } from "../../controllers/automacao/getEmpilhadeiraController";

export async function getEmpilhadeiraRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getEmpilhadeira", getEmpilhadeiraController);
}