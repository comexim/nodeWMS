import Retorno from "../../models/automacao/Retorno"
import WMS_ParadaALL from "../../models/automacao/WMS_ParadaALL";
import { executeQueryLocal, getGridCollum } from "../../utils/dbExecute"

export async function getProdParada (op: string, maqCod: string, dataIni: string, dataFim: string, usuario: string) {
    try {
        const all = new WMS_ParadaALL();

        let sql = `SELECT 
                    p.MaqCod as maqCod,
                    p.ParTipo as parTipo,
                    p.ParHoraFim as parHoraFim,
                    p.ParMotivo as parMotivo,
                    p.ParDataIni as parDataIni,
                    p.ParDataFim as parDataFim,
                    p.UserCod as userCod,
                    p.ParID as parID,
                    p.ParQtdVez as parQtdVez,
                    p.ParHoraIni as parHoraIni,
                    p.ParPeneira as parPeneira,
                (SELECT C2__GUIADG FROM SC2010 WHERE C2_NUM = p.ParOP ) AS parOP
                FROM WMS_Parada p WHERE 1<2`

        if(op.trim().length > 0) {
            sql += 'AND ParOP = @op'
        }
        if(maqCod.trim() !== 'Todos') {
            sql += ' AND MaqCod = @maqCod'
        }
        if(dataIni.trim().length > 0) {
            sql += ' AND ParDataIni >= @dataIni'
        }
        if(dataFim.trim().length > 0) {
            sql += ' AND ParDataIni <= @dataFim'
        }
        sql += ' ORDER BY ParDataIni, ParHoraIni DESC';

        const result = await executeQueryLocal(sql, {op, maqCod, dataIni, dataFim, usuario});
        const label = await getGridCollum("ProdPar", usuario);

        all.listaMov = result.recordset;
        all.labelMap = label;
        
        return all;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno! ${error}`
        })
    }
}