import Retorno from "../../models/automacao/Retorno";
import WMS_ApImasDTO from "../../models/automacao/WMS_ApImasDTO";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function getApImas(loteIni: string, dataIni: string, dataFim: string): Promise<{lst: WMS_ApImasDTO} | Retorno> {
    try {
        let sql = `SELECT
                    ApLote as apLote,
                    ApEquipto as apEquipto,
                    ApQuant as apQuant,
                    ApObs as apObs,
                    ApData as apData,
                    ApHora as apHora
                    FROM WMS_ApImas
                    WHERE 1=1`

            const params: any = {};

        if (loteIni.trim().length > 0) {
            sql += ` AND ApLote LIKE @loteIni`;
            params.loteIni = `%${loteIni}%`;
        }

        if (dataIni.trim().length > 0 && dataFim.trim().length > 0) {
            sql += ` AND ApData BETWEEN @dataIni AND @dataFim`;
            params.dataIni = dataIni;
            params.dataFim = dataFim;
        } else if (dataIni.trim().length > 0) {
            sql += ` AND ApData >= @dataIni`;
            params.dataIni = dataIni;
        }

        sql += ` ORDER BY ApData DESC, ApHora DESC`;
        
        const response = await executeQueryLocal(sql, params);
        const lst = response.recordset.map((item: any) => new WMS_ApImasDTO(item));

        return lst;
    } catch (error) {
        return new Retorno ({
            code: 400,
            type: "Error",
            message: `Erro: ${error}`
        })
    }
}