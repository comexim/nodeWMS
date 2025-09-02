import { FastifyInstance } from "fastify";
import { TokenController } from "../controllers/getTokenController";
import { createRoute } from "../utils/routerHelper";
import { schemas } from "../schemas/swaggerModels";

require('dotenv').config();

export async function getTokenRoutes(app: FastifyInstance) {
    createRoute(app, "post", "/api_wms/getToken", TokenController, {
        schema: {
            tags: ['Authentication'],
            summary: 'Obter token de autenticação',
            description: 'Endpoint para autenticação e obtenção do token JWT',
            body: schemas.TokenSchema
        } as any
    }, false); // false = não requer autenticação
}