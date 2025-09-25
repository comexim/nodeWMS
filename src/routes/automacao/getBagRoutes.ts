import { FastifyInstance } from "fastify";
import { getBagController } from "../../controllers/automacao/getBagController";
import { createRoute } from "../../utils/routerHelper";
import { schemas } from "../../schemas/swaggerModels";

export async function getBagRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getBag", getBagController, {
            schema: {
                tags: ['Bags'],
                summary: 'Pegar dados do Bag',
                description: 'Endpoint para pegar dados de um Bag',
                querystring: {
                    type: 'object',
                    properties: {
                        tagbag: {
                            type: 'string',
                            description: 'Campo BagTag da tabela WMS_Bag'
                        }
                    },
                    required: ['tagbag']
                }
            } as any
        }, true);
}