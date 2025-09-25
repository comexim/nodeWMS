import { FastifyReply, FastifyRequest } from "fastify";
import Z71DTO from "../../models/automacao/Z71DTO";
import Retorno from "../../models/automacao/Retorno";
import { alteraPesoZ71Validation } from "../../middlewares/automacao/alteraPesoZ71Validation";
import { alteraPesoZ71 } from "../../services/automacao/alteraPesoZ71";

export async function alteraPesoZ71Controller (req: FastifyRequest, reply: FastifyReply) {
    const dados = req.body as Z71DTO;

    // Verifica se os dados já são um objeto ou se é uma string que precisa ser parseada:
    let real;
    if (typeof dados === 'string') {
        try{
            real = JSON.parse(dados);
        } catch (error) {
            return new Retorno ({code: 401, type: "Error", message: "Dados inválidos - JSON malformado"});
        }
    } else {
        real = dados;
    }

    const validacao = alteraPesoZ71Validation(real);
    if (validacao) return reply.status(400).send(validacao);

    const result = await alteraPesoZ71(real);

    return result;
}