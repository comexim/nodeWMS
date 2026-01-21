import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getCheckOpController } from "../../controllers/automacao/getCheckOpController";

export async function getCheckOpRoutes (app: FastifyInstance)
{
    createRoute(app, "get", "/api_wms/getCheckOp", getCheckOpController, undefined, false);
}