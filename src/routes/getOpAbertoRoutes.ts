import { FastifyInstance } from "fastify";
import { createRoute } from "../utils/routerHelper";
import { getOpController } from "../controllers/getOpController";

export async function getOpAbertoRoutes(app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getopaberto", getOpController, {
            schema: {
                tags: ['OP'],
                summary: '',
                description: 'Buscar todas as OPs que estão em aberto. Busca executada no banco "automacao" tabela SC2010. C2__STAT = "i"',
                security: [{ Bearer: [] }]
            } as any
        }, true);
}