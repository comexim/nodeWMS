import Retorno from "../../models/automacao/Retorno";
import SilosWMSSUP from "../../models/automacao/SiloWMSSUP";
import { executeQueryLocal } from "../../utils/dbExecute"

export async function getSiloWMSSUP () {
    const sql = `SELECT SiloCod as CODIGO, 
                        SiloCapac as CAPACIDADE, 
                        SiloSaldo as SALDOWMS,
                        Total AS SALDOSUP,
                        SiloLote AS LOTE
                FROM SUP_Silos WMS, EstoqueSql SUP
                WHERE 
                SUP.Silo = WMS.SiloCod
                AND SiloEstqSN = 'S'`
    try {
        const response = await executeQueryLocal(sql);

        const lst = response.recordset.map((item: any) => {
            const saldoSupConvertido = item.SALDOSUP * 59;
            return {
                codigo: item.CODIGO,
                capacidade: item.CAPACIDADE,
                saldowms: item.SALDOWMS,
                wmssacas: Math.round((item.SALDOWMS / 59) * 100) / 100,
                saldosup: Math.round((saldoSupConvertido) *100) /100,
                supsacas: Math.round(item.SALDOSUP * 100) / 100,
                difer: (Math.round((item.SALDOWMS - saldoSupConvertido) * 100) / 100) / 59,
                lote: item.LOTE
            };
        });

        return lst;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno ${error}`
        })
    }
}