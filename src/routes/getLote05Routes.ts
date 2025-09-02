import { FastifyInstance } from "fastify";
import { createRoute } from "../utils/routerHelper";
import { getLote05Controller } from "../controllers/getLote05Controller";

export async function getLote05Routes(app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getLote05", getLote05Controller);
}