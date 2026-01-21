import { executeQueryNet } from "../../utils/dbExecute";

export async function getProdProtheusXWMS () {
    const sqlProdWMS = `SELECT 'WMS' AS TIPO, 
                            Z71_LOTECT AS LOTE, 
                            SUM(Z71_PESO) AS PESO 
                        FROM Z71010 
                        WHERE D_E_L_E_T_ <> '*' 
                            AND Z71_DATA = '20251215' 
                        GROUP BY Z71_LOTECT
                            UNION ALL
                        SELECT 'PROT' AS TIPO, 
                            D3_LOTECTL AS LOTE, 
                            SUM(D3_QUANT) AS PESO 
                        FROM SD3010 
                        WHERE D_E_L_E_T_ <> '*'
                            AND D3_ESTORNO <> 'S' 
                            AND D3_EMISSAO = '20251215' 
                            AND D3_FILIAL = '05' 
                            AND D3_LOCAL  = '01' 
                            AND D3_COD = '00100' 
                            AND D3_TM IN ('001', '002')
                        GROUP BY D3_LOTECTL`;
    try {
        const result = await executeQueryNet(sqlProdWMS);
        return result.recordset;
    } catch (error) {
        throw error;
    }
}