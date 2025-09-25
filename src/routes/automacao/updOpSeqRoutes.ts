import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { updOpSeqController } from "../../controllers/automacao/updOpSeqController";

export async function updOpSeqRoutes(app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/updopseq", updOpSeqController, {
            schema: {
                tags: ['OP'],
                summary: 'Seta o registro do sequenciamento da OP como encerrado',
                description: 'Seta o campo SeqOpStatus = "E"',
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
        }, true);
}