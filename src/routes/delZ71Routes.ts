import { FastifyInstance } from "fastify";
import { delZ71Controller } from "../controllers/delZ71Controller";
import { createRoute } from "../utils/routerHelper";
import { schemas } from "../schemas/swaggerModels";

export async function delZ71Routes (app: FastifyInstance) {
    createRoute(app, "post", "/api_wms/delZ71", delZ71Controller, {
        schema: {
            tags: ['Z71'],
            summary: 'API usada para exclusão dos dados de produção na tabela Z71 (lotes produzidos)',
            description: 'Deleta dados na tabela Z71010, banco automacao',
            querystring: {
                type: 'object',
                properties: {
                    _Recno: {
                        type: 'string',
                        description: 'Campo R_E_C_N_O_ da Z71'
                    }
                },
                required: ['_Recno']
            }
        } as any
    }, true)
}