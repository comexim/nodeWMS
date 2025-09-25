import Labels from "../../models/automacao/Labels";
import Retorno from "../../models/automacao/Retorno";
import WMS_MovEnderDTO from "../../models/automacao/WMS_MovEnderDTO";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function getMovEnder(dataIni: string, dataFim: string, tipo: string, usuario: string): Promise<{ listMov: any; labelMap: Labels} | Retorno> {
    try{
        const tipoFiltro = (tipo: string) => {
            switch(tipo) {
                case 'Embegadora':
                    return 'EMB';
                case 'Inventario':
                    return 'INV';
                case 'Empilhadeira':
                    return 'EMP';
                case 'Pesagem':
                    return 'PES';
                default:
                    return tipo;
            }
        }

        const sqlListMov = `SELECT * FROM WMS_MovEnder
                        WHERE MovEnderData >= @dataIni
                            AND MovEnderData <= @dataFim
                            AND (@tipo = '' OR MovEnderTipo = @tipo)`;
        
        const sqllabelMap = `SELECT * FROM Cmx_Grid
                            WHERE GridID = 'MovEnder'
                            AND
                            UserLogin = @usuario`;

        const listMov = await executeQueryLocal(sqlListMov, { dataIni, dataFim, tipo: tipoFiltro(tipo)});
        const labelMap = await executeQueryLocal(sqllabelMap, {usuario});

        const movEnderDto = new WMS_MovEnderDTO(listMov);
        const labels = labelMap.recordset.map((item: any) => new Labels(item));
        //@ts-ignore 
        return {listMov: movEnderDto.recordsets[0], labelMap: labels};
    } catch (error) {
        console.error("Erro em getMovEnder:", error);
        return new Retorno ({
            code: 500,
            type: "Error",
            message: error instanceof Error ? error.message : String(error)
        })
    }
}