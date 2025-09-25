import { FastifyInstance } from "fastify";
import { getApImasController } from "../../controllers/automacao/getApImasController";
import { createRoute } from "../../utils/routerHelper";

export async function getApImasRoutes(app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getapimas", getApImasController, {
            schema: {
                tags: ['Apontamento'],
                summary: 'Buscar os apontamentos na tabela WMS_ApImas',
                description: '',
                querystring: {
                    type: 'object',
                    properties: {
                        loteIni: {
                            type: 'string',
                            description: 'Campo ApLote da tabela WMS_ApImas'
                        },
                        dataIni: {
                            type: 'string',
                            description: 'Campo ApData da tabela WMS_ApImas'
                        },
                        dataFim: {
                            type: 'string',
                            description: 'Campo ApData da tabela WMS_ApImas'
                        }
                    }
                }
            } as any
        });
}