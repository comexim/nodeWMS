import Retorno from "../../models/automacao/Retorno";
import Silos from "../../models/automacao/Silos";
import SUP_SilosALL from "../../models/automacao/SUP_SilosALL";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function getSiloApp () {
    let nCapac = 0;
    let nOcup = 0;
    let nPerc = 0;

    const sql = `SELECT SiloCod, SiloDescr, SiloSetor, ROUND(SiloCapac,2) AS SiloCapac, ROUND(SiloSaldo,2) AS SiloSaldo, SiloLote 
                    FROM SUP_Silos
                    WHERE SiloEstqSN = 'S'`;

    try {
        const response = await executeQueryLocal(sql);

        const listaSilos = response.recordset.map((item: any) => {
            nCapac += item.SiloCapac;
            nOcup += item.SiloSaldo;
            const dto = new Silos();
            dto.siloCod = item.SiloCod;
            dto.siloDescr = item.SiloDescr;
            dto.siloSetor = item.SiloSetor;
            dto.siloCapac = Math.round(item.SiloCapac).toLocaleString('pt-BR');
            dto.siloSaldo = Math.round(item.SiloSaldo).toLocaleString('pt-BR');
            dto.siloSaca = Math.round(item.SiloSaldo/59).toLocaleString('pt-BR');
            dto.siloPercOcup = Math.round((item.SiloSaldo/item.SiloCapac)*100).toLocaleString('pt-BR');
            dto.siloLote = item.SiloLote;
            return dto;
        });
        
        nPerc = nOcup/nCapac * 100;
        
        const all = new SUP_SilosALL();
        all.capTotalKg = Math.round(nCapac).toLocaleString('pt-BR');
        all.capTotalSc = Math.round(nCapac/59).toLocaleString('pt-BR');
        all.capOcupKg = Math.round(nOcup).toLocaleString('pt-BR');
        all.capOcupSc = Math.round(nOcup/59).toLocaleString('pt-BR');
        all.percOcup = nPerc.toLocaleString('pt-BR');
        all.listaSilos = listaSilos;

        return all;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno (getSiloAPP): ${error}`
        })
    }
}