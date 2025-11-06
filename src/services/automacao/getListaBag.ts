import Retorno from "../../models/automacao/Retorno";
import WMS_BagDTO from "../../models/automacao/WMS_BagDTO";
import { executeQueryLocal, getEndereco } from "../../utils/dbExecute";

export async function getListaBag (lote: string, tagBag: string) {
    let sql = `SELECT BagTag, BagLote, BagStatus, BagAtuEnder, BagKgAtu FROM WMS_Bag `
    if(lote.trim().length > 0) {
        sql += `WHERE BagLote LIKE '%' + @lote + '%'`;
    } else {
        if(tagBag.trim().length > 0) {
            sql += `WHERE BagTag LIKE '%' + tagBag + '%'`;
        }
    }

    sql += ` ORDER BY BagLote, BagAtuEnder `;
    try {
        const result = await executeQueryLocal(sql, { lote, tagBag });

        const listBag: WMS_BagDTO[] =  await Promise.all (
        result.recordset.map(async (item: any) => {
            const dto = new WMS_BagDTO();
            dto.bagTag = item.BagTag;
            dto.bagLote = item.BagLote;
            dto.bagStatus = item.BagStatus;
            dto.bagAtuEnder = item.BagAtuEnder;
            dto.bagUltEnder = item.BagUltEnder;
            dto.bagKgAtu = item.BagKgAtu;
            dto.bagKgCorte = 0;
            const endereco = await getEndereco(item.BagAtuEnder);
            dto.tagAtuEnder = endereco.enderTag;
            return dto;
        })
    );
    return listBag;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno (getListaBag): ${error}`
        })
    }
}