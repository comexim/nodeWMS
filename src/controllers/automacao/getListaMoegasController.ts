import { FastifyRequest } from "fastify";
import { getListaMoegas } from "../../services/automacao/getListaMoegas";

export async function getListaMoegasController (req: FastifyRequest) {
    const response = await getListaMoegas();
    return response;
}