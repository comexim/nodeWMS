import Retorno from "../../models/automacao/Retorno";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function delOpSeq(id: string): Promise<Retorno> {
    try {
        const sql = `
            SELECT SeqOpID FROM WMS_SeqOp
            WHERE SeqOpID = @id AND SeqOpStatus = 'A'
        `;
        const sqlAux = `
            UPDATE WMS_Endereço SET EnderStatus = 'LV',
            SeqOpID = NULL WHERE SeqOpID = @id
        `;

        const verif = await executeQueryLocal(sql, { id });

        if (!verif.recordset || verif.recordset.length === 0) {
            const sqlID = `
                SELECT SeqOpID FROM WMS_SeqOp
                WHERE SeqOpID = @id
            `;
            const verif2 = await executeQueryLocal(sqlID, { id });

            if (!verif2.recordset || verif2.recordset.length === 0) {
                return new Retorno({ code: 401, type: "Error", message: "ID não existe!" });
            } else {
                return new Retorno({ code: 401, type: "Error", message: "Status da OP não está setada como A!" });
            }
        }

        await executeQueryLocal(sqlAux, { id });

        return new Retorno({
            code: 601,
            type: "Success",
            message: "Registro deletado com sucesso!"
        });
    } catch (error) {
        console.error("Erro ao deletar OP Seq:", error);
        return new Retorno({
            code: 500,
            type: "Erro",
            message: `Erro: ${error}`
        });
    }
}