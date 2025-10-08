import { FastifyInstance } from "fastify";
import { createRoute } from "../../utils/routerHelper";
import { setSiloSaldoController } from "../../controllers/automacao/setSiloSaldoController";

export async function setSiloSaldoRoutes (app: FastifyInstance) {
    createRoute(app, "post", "/api_wms/setSiloSaldo", setSiloSaldoController);
}