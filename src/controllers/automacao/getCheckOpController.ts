import { FastifyRequest } from "fastify";
import { getCheckOp } from "../../services/automacao/getCheckOp";

export async function getCheckOpController (req: FastifyRequest)
{
    const { op } = req.query as { op: string };

    const response = await getCheckOp(op);
    return response;
}