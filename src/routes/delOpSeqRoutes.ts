import { FastifyInstance } from "fastify";
import { createRoute } from "../utils/routerHelper";
import { delOpSeqController } from "../controllers/delOpSeqController";
import { schemas } from "../schemas/swaggerModels";

export async function delOpSeqRoutes(app: FastifyInstance) {
    createRoute(app, "post", "/api_wms/delopseq", delOpSeqController, {
            schema: {
                tags: ['OP'],
                summary: 'Deleta o registro do sequenciamento da OP como encerrado',
                description: 'delopseq',
                querystring: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Usa o campo SeqOpID da tabela WMS_SeqOP'
                        }
                    },
                    required: ['id']
                }
            } as any
        }, true)
}