import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { setCordCorController } from "../../controllers/automacao/setCordCorController";

export async function setCordCorRoutes (app: FastifyInstance) {
    createRoute(app, "post", "/api_protheus/setCordCor", setCordCorController);
}