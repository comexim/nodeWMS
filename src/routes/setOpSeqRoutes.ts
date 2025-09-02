import { FastifyInstance } from "fastify";
import { createRoute } from "../utils/routerHelper";
import { setOpSeqController } from "../controllers/setOpSeqController";
import { schemas } from "../schemas/swaggerModels";

export async function setOpSeqRoutes(app: FastifyInstance) {
    createRoute(app, "post", "/api_wms/setopseq", setOpSeqController, {
            schema: {
                tags: ['OP'],
                summary: '',
                description: 'Gravar o sequenciamento das OPs na tabela WMS_SeqOP do banco "automacao". Supervisório sequencia as OPs para os balões de ensaque trabalhar',
                body: schemas.SeqOpSchema
            } as any
        }, true);
}