import { FastifyInstance } from "fastify";
import { createRoute } from "../utils/routerHelper";
import { alteraPesoZ71Controller } from "../controllers/alteraPesoZ71Controller";
import { schemas } from "../schemas/swaggerModels";

export async function alteraPesoZ71Routes (app: FastifyInstance) {
    createRoute(app, "post", "/api_wms/updPesoZ71", alteraPesoZ71Controller, {
        schema: {
            tags: ['Z71'],
            summary: 'API usada para alteração do campo Z71_PESO da tabela Z71',
            description: 'Altera o peso do registro da Z71010',
            security: [{ Bearer: [] }],
            body: schemas.Z71Schema
        } as any
    }, true);
}