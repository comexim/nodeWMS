import Retorno from "../models/Retorno";
import { executeQuery } from "../utils/dbExecute";

export async function delZ71 (_Recno: number): Promise<Retorno> {
    try {
        const sql = `SELECT * FROM Z71010 WHERE Z71_PESO = 0 AND R_E_C_N_O_ = @_Recno`;
        const sqlAux = `DELETE FROM Z71010 WHERE Z71_PESO = 0 AND R_E_C_N_O_ = @_Recno`
        
        const result = await executeQuery(sql, {_Recno});
        if(result.recordset.length === 0) return new Retorno ({code: 401, type: "Erro", message: "A exclusão contém peso acima de 0"});

        await executeQuery(sqlAux, {_Recno});

        return new Retorno ({
            code: 600,
            type: "Success",
            message: "Registro deletado com sucesso!"
        })
    } catch (error) {
        return new Retorno ({
            code: 501,
            type: "Error",
            message: `Erro: ${error}`
        })
    }
}