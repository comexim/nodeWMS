import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import Z71DTO from "../models/Z71DTO";
import { setZ71Validation } from "../middlewares/setZ71Validation";
import { setZ71 } from "../services/setZ71";
import Retorno from "../models/Retorno";

export async function Z71Controller(req: FastifyRequest, reply: FastifyReply) {
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
    
    const validacao = setZ71Validation(real);
    if (validacao) return reply.status(400).send(validacao);

    const response = await setZ71(real);

    return reply.send(response);
}