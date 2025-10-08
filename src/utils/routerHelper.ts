import { FastifyInstance, FastifyRequest, FastifyReply, RouteShorthandOptions, preHandlerHookHandler } from "fastify";
import { authToken } from "../middlewares/automacao/authTokenValidation";

// Função para ajustar o path baseado no ambiente
function getEnvironmentPath(path: string): string {
    const isTest = process.env.DATABASELOCAL === 'Teste';
    
    if (path.includes('/api_wms/')) {
        return isTest ? path.replace('/api_wms/', '/api_wms_teste/') : path;
    }
    
    return path;
}

export function createRoute(
    app: FastifyInstance,
    method: "get" | "post" | "put" | "delete",
    path: string,
    handler: (req: FastifyRequest, reply: FastifyReply) => Promise<any>,
    swaggerOptions?: RouteShorthandOptions,
    requireAuth: boolean = true,
    authMiddleware: preHandlerHookHandler = authToken
) {
    const finalPath = getEnvironmentPath(path);
    
    const options: RouteShorthandOptions = {
        ...(requireAuth && { preHandler: authMiddleware }),
        ...swaggerOptions
    } 

    app[method](finalPath, options, async (req, reply) => {
        try {
            const result = await handler(req, reply);
            if (result !== undefined){
                return result;
            }
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: "Erro interno" });
        }
    });
}