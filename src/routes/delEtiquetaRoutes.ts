import { FastifyInstance } from "fastify";
import { createRoute } from "../utils/routerHelper";
import { delEtiquetaController } from "../controllers/delEtiquetaController";

export async function delEtiquetaRoutes(app:FastifyInstance) {
    createRoute(app,"post","/api_wms/delEtiqueta",delEtiquetaController)
}