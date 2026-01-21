import { executeQueryLocal } from "../../utils/dbExecute";

export async function getBagEnder () {
    const sqlEndereco = `SELECT EnderCod AS POSICAO FROM WMS_Endereco WHERE EnderStatus = 'LV'`

    const sqlBag = `SELECT RIGHT(BagTag, 6) AS TAG, 
                           BagLote AS LOTE, 
                           BagKgAtu AS PESO, 
                           BagScAtu AS SACAS 
                    FROM WMS_Bag 
                           WHERE BagKgAtu <= 800.00 
                    AND 
                           BagLote <> '' 
                    ORDER BY BagKgAtu DESC`
    try {
        const resultEndereco = await executeQueryLocal(sqlEndereco);
        const resultBag = await executeQueryLocal(sqlBag);
        
        const enderecos = resultEndereco.recordset.map((row: any) => row.POSICAO);
        return {
            enderecos,
            totalEnderecos: enderecos.length,
            bags: resultBag.recordset
        };
    } catch (error) {
        throw error;
    }
}