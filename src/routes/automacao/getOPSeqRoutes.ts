import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { getOPSeqController } from "../../controllers/automacao/getOPSeqController";

export async function getOPSeqRoutes (app: FastifyInstance) {
    createRoute(app, "get", "/api_wms/getopseq", getOPSeqController, {
            schema: {
                tags: ['OP'],
                summary: '',
                description: 'Traz a lista do sequênciamento das OPs que o supervisório realizou para os balões de ensaque',
                querystring: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Usa o campo SeqOpID da tabela WMS_SeqOP'
                        },
                        local: {
                            type: 'string',
                            description: 'Usa o campo SeqOpDestino da tabela WMS_SeqOP'
                        }
                    }
                }
            } as any
        }, true);
}