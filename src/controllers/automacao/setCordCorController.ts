import { FastifyRequest } from "fastify";
import { setCordCor } from "../../services/automacao/setCordCor";

export async function setCordCorController (req: FastifyRequest) {
    const params = req.body as any;
    
    console.log('Parâmetros recebidos no controller:', JSON.stringify(params, null, 2));
    
    const response = await setCordCor(params.cord1, params.cord2, params.identi1, params.identi2);
    return response;
}