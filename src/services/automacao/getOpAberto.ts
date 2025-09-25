import SC2DTO from "../../models/automacao/SC2DTO";
import { executeQueryLocal } from "../../utils/dbExecute"

export async function getOpAberto(): Promise<SC2DTO> {
    const sql = `
        SELECT 
            TRIM(o.C2_NUM) AS op,
            TRIM(o.C2_DATPRI) AS data,
            TRIM(o.C2__GUIADG) AS gds,
            o.C2_QUANT AS peso,
            o.C2_QUANT/59 AS sacas,
            TRIM(o.C2__REFERE) AS refer
        FROM SC2010 o
        WHERE o.C2__STAT = 'I'
        ORDER BY o.C2_NUM;    
`

    const result = await executeQueryLocal(sql);

    const lst = new SC2DTO(result);

    return lst;
}