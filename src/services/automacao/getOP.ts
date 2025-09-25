import { executeQueryLocal } from "../../utils/dbExecute"

export async function getOP (numOP: string) {
    const sql = `
            SELECT 
                CAST(o.R_E_C_N_O_ as INT) AS rec,
                o.C2_NUM AS op,
                ISNULL(C2__TPSRV, '') AS Servico,
                o.C2_DATPRI AS data,
                o.C2__GUIADG AS gds,
                o.C2_QUANT AS peso,
                o.C2_QUANT/59 AS sacas,
                o.C2__REFERE AS refer
            FROM SC2010 o
            WHERE C2_NUM = @numOP
`

    const op = await executeQueryLocal(sql, { numOP });
    const result = op.recordset[0];

    for(const key in result){
        if(typeof result[key] === "string") {
            result[key] = result[key].trim();
        }
    }
    
    return result;
}