import { FastifyInstance } from "fastify";
import { Z71Controller } from "../controllers/setZ71Controller";
import { createRoute } from "../utils/routerHelper";
import { schemas } from "../schemas/swaggerModels";

export async function z71Routes(app: FastifyInstance) {
    createRoute(app, "post", "/api_wms/setZ71", Z71Controller, {
        schema: {
            tags: ['Z71'],
            summary: 'Criar um registro Z71',
            description: 'Endpoint para criar um novo registro Z71',
            security: [{ Bearer: [] }],
            body: schemas.Z71Schema
        } as any
    });
}