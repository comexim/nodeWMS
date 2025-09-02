import { FastifyInstance } from "fastify";
import { createRoute } from "../utils/routerHelper";
import { setApImasController } from "../controllers/setApImasController";
import { schemas } from "../schemas/swaggerModels";

export async function setApImasRoutes(app: FastifyInstance) {
    createRoute(app, "post", "/api_wms/setapimas", setApImasController, {
            schema: {
                tags: ['Apontamento'],
                summary: 'Criar um apontamento na tabela WMS_ApImas',
                description: 'setApImasRoutes',
                body: schemas.ApImasSchema
            } as any
        }, false)
}