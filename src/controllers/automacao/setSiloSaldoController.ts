import { FastifyRequest } from "fastify";
import MovSilos from "../../models/automacao/MovSilos";
import { setSiloSaldoValidation } from "../../middlewares/automacao/setSiloSaldoValidation";
import { setSiloSaldo } from "../../services/automacao/setSiloSaldo";

export async function setSiloSaldoController (req: FastifyRequest) {
    const dados = req.body as MovSilos;

    const validation = await setSiloSaldoValidation(dados);
    if(validation) return validation;

    const response = await setSiloSaldo(dados);
    return response;
}