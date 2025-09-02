import { FastifyInstance, FastifyRequest, FastifyReply, RouteShorthandOptions } from "fastify";
import { authToken } from "../middlewares/authTokenValidation";

export function createRoute(
    app: FastifyInstance,
    method: "get" | "post" | "put" | "delete",
    path: string,
    handler: (req: FastifyRequest, reply: FastifyReply) => Promise<any>,
    swaggerOptions?: RouteShorthandOptions,
    requireAuth: boolean = true
) {
    const options: RouteShorthandOptions = {
        ...(requireAuth && { preHandler: authToken }),
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