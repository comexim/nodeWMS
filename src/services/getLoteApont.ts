import Retorno from "../models/Retorno";
import { executeQuery } from "../utils/dbExecute";

export async function getLoteApont(lote: string, apEquipto: string): Promise<Retorno> {
    try {
        const sql = `SELECT * FROM WMS_ApImas WHERE ApLote = @lote AND ApEquipto = @apEquipto`

        const result = await executeQuery(sql, { lote, apEquipto });

        if(result.recordset.length > 0) {
            return new Retorno ({
                code: 200,
                type: "Success",
                message: "Lote encontrado",
                data: result.recordset[0]
            });
        } else {
            return new Retorno ({
                code: 404,
                type: "NotFound",
                message: "Lote não encontrado"
            });
        }
    } catch(error) {
        return new Retorno ({
            code: 500,
            type: "Error",
            message: `Erro: ${error}`
        })
    }
}