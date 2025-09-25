import { FastifyReply, FastifyRequest } from "fastify";
import WMS_ApImasDTO from "../../models/automacao/WMS_ApImasDTO";
import Retorno from "../../models/automacao/Retorno";
import { setApImasValidation } from "../../middlewares/automacao/setApImasValidation";
import { setApImas } from "../../services/automacao/setApImas";

export async function setApImasController(req: FastifyRequest, reply: FastifyReply) {
    const dados = req.body as WMS_ApImasDTO;

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

    const validacao = await setApImasValidation(real);
    if(validacao) return reply.status(400).send(validacao);

    const response = await setApImas(real);
    return response;
}