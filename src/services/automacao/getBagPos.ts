import Retorno from "../../models/automacao/Retorno";
import { executeQueryLocal } from "../../utils/dbExecute"

export async function getBagPos ()
{
    const sql = `SELECT COUNT(CASE WHEN BagStatus = 'LV' THEN 1 END) AS LIVRES,
                    COUNT(CASE WHEN BagStatus = 'DP' THEN 1 END) AS DEPOSITADAS,
                    COUNT(CASE WHEN BagStatus = 'EMB' THEN 1 END) AS EMBEGADAS,
                    COUNT(CASE WHEN BagStatus = 'TRA' THEN 1 END) AS TRANSITO,
                    COUNT(CASE WHEN BagStatus = 'COR' THEN 1 END) AS CORTES,
                    COUNT(CASE WHEN BagStatus = 'DP' AND BagKgAtu = '0' THEN 1 END) AS ZERADOS,
                    (SELECT COUNT (*) FROM (SELECT BagTag FROM WMS_Bag GROUP BY BagTag HAVING COUNT (*) >=2) X ) AS QTDE_BAG_DUPLICADA
                FROM WMS_Bag;`

    const sqlAux  = `SELECT 
                        b.BagTag,
                        b.BagAtuEnder,
                        e.BagLote
                    FROM WMS_Bag b
                    INNER JOIN WMS_Endereco e
                        ON e.EnderCod = b.BagAtuEnder;`

    const sqlEmb = `SELECT BagTag, CASE WHEN BagAtuEnder = '' THEN BagUltEnder ELSE BagAtuEnder END AS BagEnder, BagLote FROM WMS_Bag WHERE BagStatus = 'EMB';`;
    const sqlTra = `SELECT BagTag, CASE WHEN BagAtuEnder = '' THEN BagUltEnder ELSE BagAtuEnder END AS BagEnder, BagLote FROM WMS_Bag WHERE BagStatus = 'TRA';`;
    const sqlCor = `SELECT BagTag, CASE WHEN BagAtuEnder = '' THEN BagUltEnder ELSE BagAtuEnder END AS BagEnder, BagLote FROM WMS_Bag WHERE BagStatus = 'COR';`;

    try {
        const [responseCount, responseBags, responseEmb, responseTra, responseCor] = await Promise.all([
            executeQueryLocal(sql),
            executeQueryLocal(sqlAux),
            executeQueryLocal(sqlEmb),
            executeQueryLocal(sqlTra),
            executeQueryLocal(sqlCor)
        ]);

        // Agrupar bags pelo prefixo do endereço (removendo a última letra)
        const bagsGrouped: { [key: string]: any[] } = {};
        
        responseBags.recordset.forEach((bag: any) => {
            const endereco = bag.BagAtuEnder;
            // Remove a última letra do endereço (ex: 200K01C -> 200K01)
            const prefixoEndereco = endereco.slice(0, -1);
            
            if (!bagsGrouped[prefixoEndereco]) {
                bagsGrouped[prefixoEndereco] = [];
            }
            bagsGrouped[prefixoEndereco].push({
                SubEndereco: endereco,
                BagTag: bag.BagTag.slice(-6), // Pega apenas os últimos 6 caracteres
                BagLote: bag.BagLote
            });
        });

        // Transformar em array de endereços e ordenar as bags por SubEndereco
        const enderecos = Object.keys(bagsGrouped).map(prefixo => ({
            Endereco: prefixo,
            Bags: bagsGrouped[prefixo].sort((a, b) => a.SubEndereco.localeCompare(b.SubEndereco))
        }));

        // Processar bags embarcadas
        const bagsEmb = responseEmb.recordset.map((bag: any) => ({
            BagTag: bag.BagTag.slice(-6),
            Endereco: bag.BagEnder,
            BagLote: bag.BagLote
        }));

        // Processar bags em trânsito
        const bagsTra = responseTra.recordset.map((bag: any) => ({
            BagTag: bag.BagTag.slice(-6),
            Endereco: bag.BagEnder,
            BagLote: bag.BagLote
        }));

        // Processar bags com corte
        const bagsCor = responseCor.recordset.map((bag: any) => ({
            BagTag: bag.BagTag.slice(-6),
            Endereco: bag.BagEnder,
            BagLote: bag.BagLote
        }));

        return {
            ...responseCount.recordset[0],
            Enderecos: enderecos,
            Embarcadas: bagsEmb,
            Transito: bagsTra,
            Cortes: bagsCor
        };
    } catch (error) {
        return new Retorno({
            code: 500,
            type: "Error",
            message: `Erro getBagPos ${error}`
        })
        
    }
}