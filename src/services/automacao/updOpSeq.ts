import Retorno from "../../models/automacao/Retorno";
import { executeQueryLocal } from "../../utils/dbExecute"

export async function updOpSeq(id: string): Promise<Retorno> {
    try{
        const sql = `
            UPDATE WMS_SeqOP
            SET SeqOpStatus = 'E'
            WHERE SeqOpID = @id
        `

        await executeQueryLocal(sql, { id });

        const sqlAux = `
            UPDATE WMS_Endereco
            SET EnderStatus = 'LV', SeqOpID = NULL
            WHERE SeqOpID = @id   
        `

        await executeQueryLocal(sqlAux, { id });

        return new Retorno ({
            code: 601,
            type: "Success",
            message: "01 Registro alterado com sucesso!"
        })
    } catch (error) {
        return new Retorno ({ 
            code: 501,
            type: "Error",
            message: `Erro: ${error}`
        })
    }
}