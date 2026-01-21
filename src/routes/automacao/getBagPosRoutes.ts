import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getBagPosController } from "../../controllers/automacao/getBagPosController";

export async function getBagPosRoutes (app: FastifyInstance) 
{
    createRoute(app, "get", "/api_wms/getBagPos", getBagPosController);
}