import { FastifyRequest } from "fastify";
import { getTempoMotoristaValidation } from "../../middlewares/automacao/getTempoMotoristaValidation";
import { getTempoMotorista } from "../../services/automacao/getTempoMotorista";

export async function getTempoMotoristaController (req: FastifyRequest) {
    const { optck, osid } = req.query as { optck: string, osid: string };

    const validation = await getTempoMotoristaValidation(optck);
    if(validation) return validation;

    const response = await getTempoMotorista(optck, osid);
    return response;
}