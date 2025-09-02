import WMS_SeqOpDTO from "../models/WMS_SeqOpDTO";
import { executeQuery } from "../utils/dbExecute"

export async function getOPSeq (id: number, local: string): Promise<WMS_SeqOpDTO> {
    const sql = `
            SELECT            
                    SeqOpID as seqOpID,
                    SeqOpNum as seqOpNum,
                    SeqOpLote as seqOpLote,
                    SeqOpPeneira as seqOpPeneira,
                    SeqOpPeso as seqOpPeso,
                    SeqOpSacas as seqOpSacas,
                    SeqOpBags as seqOpBags,
                    SeqOpDestino as seqOpDestino,
                    SeqOpData as seqOpData,
                    SeqOpHora as seqOpHora,
                    SeqOpStatus as seqOpStatus,
                    ISNULL(SeqOpServico, '') AS seqOpServico,
                    ISNULL(
                    (SELECT TOP 1 C2__REFERE 
                    FROM SC2010 
                    WHERE C2_NUM = SeqOpNum),
                    '') AS refere
                    FROM WMS_SeqOP 
                    WHERE SeqOpStatus <> 'E' 
                    AND (@id IS NULL OR SeqOpID = @id)
                    AND (@local IS NULL OR @local = '' OR SeqOpDestino = @local)
                    ORDER BY SeqOpID, SeqOpData, SeqOpHora;
`
    const op = await executeQuery(sql, { id , local });
    const raw = op.recordset[0];

    for(const key in raw){
        if(typeof raw[key] === "string") {
            raw[key] = raw[key].trim();
        }
    }

    const result = new WMS_SeqOpDTO(raw);

    return result;
}