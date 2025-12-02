import Retorno from "../../models/automacao/Retorno";
import SilosWMSSUP from "../../models/automacao/SiloWMSSUP";
import { executeQueryLocal } from "../../utils/dbExecute"

export async function getSiloWMSSUP () {
    const sql = `SELECT SiloCod as CODIGO, 
                        SiloCapac as CAPACIDADE, 
                        SiloSaldo as SALDOWMS, 
                        Total AS SUP, 
                        SiloSaldo - Total AS DIFER, 
                        SiloLote AS LOTE
                FROM SUP_Silos WMS, EstoqueSql SUP
                WHERE 
                SUP.Silo = WMS.SiloCod
                AND SiloEstqSN = 'S'`
    try {
        const response = await executeQueryLocal(sql);

        const lst = response.recordset.map((item: any) => {
            const dto = new SilosWMSSUP();
            dto.codigo = item.CODIGO;
            dto.capacidade = item.CAPACIDADE;
            dto.saldowms = item.SALDOWMS;
            dto.sup = item.SUP;
            dto.difer = item.DIFER;
            dto.lote = item.LOTE;
            return dto;
        })

        return lst;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno ${error}`
        })
    }
}