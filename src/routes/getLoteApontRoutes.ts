import { FastifyInstance } from "fastify";
import { createRoute } from "../utils/routerHelper";
import { getLoteApontController } from "../controllers/getLoteApontController";

export async function getLoteApontRoutes(app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getloteapont", getLoteApontController);
}