import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getTokenProtheusController } from "../../controllers/protheus/getTokenProtheusController";
import { authTokenProtheus } from "../../middlewares/automacao/authTokenValidation";

export async function getTokenProtheusRoutes (app: FastifyInstance) {
    createRoute(app, "post", "/api_protheus/getToken", getTokenProtheusController, undefined, false, authTokenProtheus);
}