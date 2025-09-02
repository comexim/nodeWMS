import { FastifyInstance } from "fastify";
import { createRoute } from "../utils/routerHelper";
import { getMovEnderController } from "../controllers/getMovEnderController";

export async function MovEnderRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getMovEnder", getMovEnderController, {
                schema: {
                    tags: ['Endereçamento'],
                    summary: '',
                    description: 'getMovEnder',
                    querystring: {
                        type: 'object',
                        properties: {
                            dataIni: {
                                type: 'string'
                            },
                            dataFim: {
                                type: 'string'
                            },
                            tipo: {
                                type: 'string'
                            },
                            usuario: {
                                type: 'string'
                            }
                        },
                        required: ['dataIni','dataFim','tipo','usuario']
                    }
                } as any
            }, true);
}