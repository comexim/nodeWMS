import { executeQueryLocal, executeQueryNet } from "../../utils/dbExecute"

export async function getCheckOp (op: string)
{
    const sql = `SELECT C2__GUIADG, C2__OBSSRV FROM SC2010 WHERE C2_NUM = @op AND D_E_L_E_T_ <> '*'` // Usa o NET
    const sqlAux = `SELECT * FROM WMS_ApImas WHERE ApLote LIKE '%' + @lote` // Usa o Local
    try {
        // Busca o lote da OP no sistema NET
        const resultNet = await executeQueryNet(sql, { op });
        
        if (resultNet.recordset.length === 0) {
            return {message: "OP não encontrada no sistema SC2010."};
        }
        
        const lote = (resultNet.recordset[0].C2__GUIADG || "").toString().trim();
        let obs = (resultNet.recordset[0].C2__OBSSRV || "").toString().trim();
        // Normaliza quebras de linha e remove caracteres não imprimíveis
        obs = obs.replace(/[\r\n]+/g, ' ').replace(/[^\x20-\x7EÀ-ÿ"]/g, '');
        
        if (!lote) {
            return {message: "OP não possui lote vinculado!"};
        }
        
        // Verifica se existe apontamento de impurezas no sistema
        const resultLocal = await executeQueryLocal(sqlAux, { lote });
        
        if (resultLocal.recordset.length === 0) {
            return {message: "Lembrete: Apontamento de impurezas nos imãs ainda não realizado!", obs: obs};
            
        }
        
        return {
            success: true,
            lote: lote,
            apontamento: resultLocal.recordset[0],
            obs: obs
        };
        
    } catch (error) {
        throw error;
    }
}