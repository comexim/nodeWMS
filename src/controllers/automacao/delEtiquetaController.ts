import { FastifyReply, FastifyRequest } from "fastify";
import { delEtiquetaValidation } from "../../middlewares/automacao/delEtiquetaValidation";
import { delEtiqueta } from "../../services/automacao/delEtiqueta";

export async function delEtiquetaController(req:FastifyRequest,reply:FastifyReply) {
    const {bagTag, bagLote} = req.query as {bagTag:String, bagLote:String}
    const validation = await delEtiquetaValidation(bagTag, bagLote)
    if(validation) {
        return reply.status(500).send(validation)
    }

    //const result = await delEtiqueta(bagTag, bagLote)
    //return result
}