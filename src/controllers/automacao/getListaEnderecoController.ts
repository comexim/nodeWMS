import { FastifyRequest } from "fastify";
import { getListaEndereco } from "../../services/automacao/getListaEndereco";

export async function getListaEnderecoController (req: FastifyRequest) {
    const { bloco, quadra, posicao, status } = req.query as { bloco: string, quadra: string, posicao: string, status: string };

    const result = await getListaEndereco(bloco, quadra, posicao, status);
    return result;
}