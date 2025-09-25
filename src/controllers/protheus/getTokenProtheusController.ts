import { FastifyReply, FastifyRequest } from "fastify";
import { getTokenProtheusValidation } from "../../middlewares/protheus/getTokenProtheusValidation";
import { getTokenProtheus } from "../../services/protheus/getTokenProtheus";

export async function getTokenProtheusController (req: FastifyRequest, reply: FastifyReply) {
    const dados = req.body;

    const validacao = getTokenProtheusValidation(dados);
    if(validacao) return(validacao);

    const response = await getTokenProtheus(dados);
    return response;
}