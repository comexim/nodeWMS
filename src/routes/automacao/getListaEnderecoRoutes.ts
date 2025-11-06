import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getListaEnderecoController } from "../../controllers/automacao/getListaEnderecoController";

export async function getListaEnderecoRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getListaEndereco", getListaEnderecoController);
}