import { executeQueryLocal } from "../../utils/dbExecute";

export async function getInventario () {
    const sql = `SELECT MovEnderID, BagTag, BagLote, MovEnderData, MovEnderHora, MovEnderPeso FROM WMS_MovEnder WHERE MovEnderTipo = 'INV';`;
    try {
        const response = await executeQueryLocal(sql);

        const list = response.recordset.map((item: any) => {
            const dataIni = item.
        })
    } catch (error) {
        
    }
}