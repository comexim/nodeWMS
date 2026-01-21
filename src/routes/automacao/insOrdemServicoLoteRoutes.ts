import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";

export async function insOrdemServicoLoteRoutes (app: FastifyInstance)
{
    createRoute(app, "post", "/api_wms/insOrdemServicoLote" );
}