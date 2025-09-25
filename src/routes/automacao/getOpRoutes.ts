import { FastifyInstance } from "fastify";
import { getOpController } from "../../controllers/automacao/getOpController";
import { createRoute } from "../../utils/routerHelper";

export async function getOpRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getop", getOpController, {
            schema: {
                tags: ['OP'],
                summary: '',
                description: 'Buscar uma determinada OP de acordo com o parâmetro. Busca executada no banco "automacao", tabela SC2010',
                querystring: {
                    type: 'object',
                    properties: {
                        numOP: {
                            type: 'string',
                            description: 'Número da OP'
                        }
                    }
                }
            } as any
        }, true);
}