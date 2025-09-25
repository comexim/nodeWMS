import { FastifyInstance, FastifyRequest, FastifyReply, RouteShorthandOptions, preHandlerHookHandler } from "fastify";
import { authToken } from "../middlewares/automacao/authTokenValidation";

export function createRoute(
    app: FastifyInstance,
    method: "get" | "post" | "put" | "delete",
    path: string,
    handler: (req: FastifyRequest, reply: FastifyReply) => Promise<any>,
    swaggerOptions?: RouteShorthandOptions,
    requireAuth: boolean = true,
    authMiddleware: preHandlerHookHandler = authToken
) {
    const options: RouteShorthandOptions = {
        ...(requireAuth && { preHandler: authMiddleware }),
        ...swaggerOptions
    } 

    app[method](path, options, async (req, reply) => {
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