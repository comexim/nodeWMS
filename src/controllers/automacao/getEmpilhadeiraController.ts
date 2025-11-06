import { FastifyRequest } from "fastify";
import { getEmpilhadeira } from "../../services/automacao/getEmpilhadeira";

export async function getEmpilhadeiraController (req: FastifyRequest) {
    const response = await getEmpilhadeira();
    return response;
}