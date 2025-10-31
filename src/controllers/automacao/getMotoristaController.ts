import { FastifyRequest } from "fastify";
import { getMotorista } from "../../services/automacao/getMotorista";

export async function getMotoristaController (req: FastifyRequest) {
    const { login, senha } = req.query as { login: string, senha: string};

    const response = await getMotorista(login, senha);
    return response;
}