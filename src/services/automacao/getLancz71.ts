import Retorno from "../../models/automacao/Retorno";
import Z71DTO from "../../models/automacao/Z71DTO";
import { executeQueryLocal } from "../../utils/dbExecute"

export async function getLancz71 (_SeqOpId: string, _NumOP: string, _Setor: string, _Tipo: string, _Chv: string, _OpTck: string): Promise<{lanc: Z71DTO} | Retorno> {
    try{

        const sql = `
            SELECT
                CAST(R_E_C_N_O_ AS INT) AS rec,
                Z71_DATA AS data,
                Z71_HORA AS hora,
                Z71_OP AS op,
                Z71_LOTECT AS lote,
                Z71_APPROD AS approd,
                CAST(Z71_VOLS AS VARCHAR) AS vols,
                Z71_EMBAL AS embal,
                Z71_PESO AS peso,
                Z71_PESO/59 AS sacas,
                Z71_SETOR AS setor,
                Z71_OPTCK AS opTck,
                Z71_SEQLOT AS seq,
                Z71_TAGRF AS tag
            FROM Z71010
            WHERE 1=1
            AND (@_SeqOpId IS NULL OR @_SeqOpId = '' OR Z71_SEQOPID = @_SeqOpId)
            AND (@_NumOP IS NULL OR @_NumOP = '' OR Z71_OP = @_NumOP)
            AND (@_Setor IS NULL OR @_Setor = '' OR Z71_SETOR = @_Setor)
            AND (@_Chv IS NULL OR @_Chv = '' OR Z71_HISTCHV = @_Chv)
            AND (@_Tipo IS NULL OR @_Tipo != 'Aberto' OR Z71_PESO = 0)
            AND (@_OpTck IS NULL OR @_OpTck = '' OR Z71_OPTCK = @_OpTck)
            ORDER BY Z71_LOTECT, Z71_SEQLOT
            `

        const result = await executeQueryLocal(sql, {_SeqOpId, _NumOP, _Setor, _Tipo, _Chv, _OpTck});
        const lanc = result.recordset.map((item: any) => new Z71DTO(item))

        return lanc;
    } catch (error) {
        return new Retorno({
            code: 401,
            type: "Error",
            message: "Erro interno"
        })
    }
}