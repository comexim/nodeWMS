import WMS_OSDTO from "../../models/automacao/WMS_OSDTO";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function getOSMoega (moega: any) {
    const sql = `SELECT OSID FROM WMS_OSMoega
                    WHERE UPPER(EnderCod) = @moega`;
    try {
        const result = await executeQueryLocal(sql, moega);

        const listDTO: WMS_OSDTO[] = result.recordset.map((item: any) => {
            const osdto = new WMS_OSDTO();
            osdto.oSID = item.OSID; 
            return osdto;
        });

        return listDTO;
    } catch (error) {
        throw error;
    }
}