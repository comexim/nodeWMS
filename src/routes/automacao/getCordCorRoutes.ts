import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getCodCorController } from "../../controllers/automacao/getCodCorController";

export async function getCordCorRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_protheus/getCordCor", getCodCorController);
}