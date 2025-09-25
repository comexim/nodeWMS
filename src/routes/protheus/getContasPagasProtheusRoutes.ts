import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { authTokenProtheus } from "../../middlewares/automacao/authTokenValidation";
import { getContasPagasProtheusController } from "../../controllers/protheus/getContasPagasProtheusController";

export async function getContasPagasProtheusRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_protheus/getContasPagas", getContasPagasProtheusController, undefined, true, authTokenProtheus);
}