import Retorno from "../../models/automacao/Retorno";
import Z71DTO from "../../models/automacao/Z71DTO";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function getZ71Prod(lote: string, setor: string, opticket: string, optck: string, recno: string): Promise<{lst: Z71DTO} | Retorno> {
    try {
            let sql = `SELECT 
            CAST(R_E_C_N_O_ as INTEGER) as rec, 
            Z71_DATA as data, 
            Z71_HORA as hora,
            Z71_OP as op, 
            Z71_LOTECT as lote, 
            Z71_OPTCK as opTck, 
            Z71_APPROD as approd, 
            CAST(Z71_VOLS as VARCHAR) as vols, 
            Z71_EMBAL as embal,
            ISNULL(Z71_LINCAF,'') as linha, 
            Z71_HISTCHV as chvSeq, 
            Z71_PESO as peso,
            Z71_PESO/59 as sacas, 
            Z71_SETOR as setor, 
            Z71_SEQLOT as seq, 
            Z71_TAGRF as tag,
            CAST(05 as VARCHAR) as filial 
            FROM Z71010
            WHERE 1=1`

            if(lote.trim().length > 0) {
                sql += ` AND Z71_LOTECT LIKE '%' + @lote + '%'`;
            }
            if(setor.trim().length > 0) {
                sql += ` AND Z71_SETOR = @setor`;
            }
            if(opticket.trim().length > 0) {
                sql += ` AND Z71_OP = @opticket`;
            }
            if(optck.trim().length > 0) {
                sql += ` AND Z71_OPTCK = @optck`;
            }
            if(recno.trim().length > 0) {
                sql += ` AND Z71_HISTCHV = @recno`;
            }

            const response = await executeQueryLocal(sql, { lote, setor, opticket, optck, recno });

            const lst = response.recordset.map((item: any) => new Z71DTO(item));

            return lst;
    } catch (error) {
        return new Retorno ({
            code: 500,
            type: "Error",
            message: `Erro: ${error}`
        })
    }
}