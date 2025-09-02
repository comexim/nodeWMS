import { FastifyInstance } from "fastify";
import { createRoute } from "../utils/routerHelper";
import { getz71ProdController } from "../controllers/getz71ProdController";

export async function getZ71ProdRoutes(app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getz71prod", getz71ProdController, {
                schema: {
                    tags: ['Z71'],
                    summary: 'Busca registro de produção na tabela Z71 do banco automação',
                    description: 'API usada na tela de descarga, tablet',
                    querystring: {
                        type: 'object',
                            properties: {
                                lote: {
                                    type: 'string',
                                    description: 'Usa o campo Z71_LOTECT da tabela Z71'
                                },
                                setor: {
                                    type: 'string',
                                    description: 'Usa o campo Z71_SETOR da tabela Z71'
                                },
                                opticket: {
                                    type: 'string',
                                    description: 'Usa o campo Z71_OP da tabela Z71'
                                },
                                optck: {
                                    type: 'string',
                                    description: 'Usa o campo Z71_OPTCK da tabela Z71'
                                },
                                recno: {
                                    type: 'string',
                                    description: 'Usa o campo Z71_HISTCHV da tabela Z71'
                                }                                  
                            }
                    }
                } as any
            }, true);
}