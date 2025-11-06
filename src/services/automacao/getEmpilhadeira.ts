import Retorno from "../../models/automacao/Retorno";
import WMS_EmpilhadeiraDTO from "../../models/automacao/WMS_EmpilhadeiraDTO";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function getEmpilhadeira () {
    try {
        const sql = `SELECT EmpiCod, EmpiDescr
                        FROM WMS_Empilhadeira`;
        const response = await executeQueryLocal(sql);

        const listEmp: WMS_EmpilhadeiraDTO[] = response.recordset.map((item: any) => {
            const empDto = new WMS_EmpilhadeiraDTO();
            empDto.empicod = item.EmpiCod;
            empDto.empidescr = item.EmpiDescr;
            return empDto;
        })

        return listEmp;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno: ${error}`
        })
    }
}