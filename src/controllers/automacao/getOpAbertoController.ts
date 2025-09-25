import { FastifyReply, FastifyRequest } from "fastify";
import { getOpAberto } from "../../services/automacao/getOpAberto";

export async function getOpAbertoController (req: FastifyRequest, reply: FastifyReply) {
    const aberto = await getOpAberto();

    return aberto;
}