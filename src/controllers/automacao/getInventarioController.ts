import { FastifyRequest } from "fastify";
import { getInventario } from "../../services/automacao/getInventario";

export async function getInventarioController () {
    const response = await getInventario();
    return response;
}