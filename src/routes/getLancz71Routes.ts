import { FastifyInstance } from "fastify";
import { getLancz71Controller } from "../controllers/getLancz71Controller";
import { createRoute } from "../utils/routerHelper";
import { schemas } from "../schemas/swaggerModels";

export async function getLancz71Routes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getlancz71", getLancz71Controller, {
            schema: {
                tags: ['Z71'],
                summary: 'Busca registros de produção na tabela Z71 do banco automação',
                description: 'getlancz71',
                querystring: {
                    type: 'object',
                    properties: {
                        _SeqOpId: {
                            type: 'string',
                            description: 'Usa o campo Z71_SEQOPID da tabela Z71'
                        },
                        _NumOP: {
                            type: 'string',
                            description: 'Usa o campo Z71_OP da tabela Z71'
                        },
                        _Setor: {
                            type: 'string',
                            description: 'Usa o campo Z71_SETOR da tabela Z71'
                        },
                        _Tipo: {
                            type: 'string',
                            description: "Caso 'Aberto' traz Z71_PESO = 0 da tabela Z71"
                        },
                        _Chv: {
                            type: 'string',
                            description: 'Usa o campo Z71_HISTCHV da tabela Z71'
                        },
                        _OpTck: {
                            type: 'string',
                            description: 'Usa o campo Z71_OPTCK da tabela Z71'
                        }
                    },
                    //required: ['']
                } 
            } as any
        }, true);
}