import Retorno from "../../models/automacao/Retorno";
import Z71DTO from "../../models/automacao/Z71DTO";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function getLote05(lote: string): Promise<Z71DTO | Retorno> {
    try {
            const sql = `SELECT
                    R_E_C_N_O_ as rec,
                    Z71_DATA as data,
                    Z71_HORA as hora,
                    Z71_OP as op,
                    Z71_LOTECT as lote,
                    ISNULL(Z71_HISTCHV,'') as chvSeq,
                    Z71_APPROD as approd,
                    Z71_VOLS as vols,
                    Z71_EMBAL as embal,
                    Z71_PESO as peso,
                    Z71_PESO/59 as sacas,
                    Z71_SETOR as setor,
                    Z71_OPTCK as opTck,
                    Z71_SEQLOT as seq,
                    Z71_TAGRF as tag
                    FROM Z71010
                        WHERE
                    Z71_LOTECT LIKE @lote
                    ORDER BY Z71_LOTECT, Z71_SEQLOT`;

            const result = await executeQueryLocal(sql, { lote: `%${lote}%` });
            const lst = result.recordset.map((item: any) => new Z71DTO(item));

            return lst;
    } catch (error) {
        return new Retorno ({
            code: 400,
            type: "Error",
            message: `Erro: ${error}`
        })
    }
}