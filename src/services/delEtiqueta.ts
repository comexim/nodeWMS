import Retorno from "../models/Retorno"
import { executeQueryLocal, executeQueryNet } from "../utils/dbExecute"

export async function delEtiqueta(bagTag:String, bagLote:String) {
    try{
        const sqlCons = `SELECT Z71_TAGRF FROM Z71010 WHERE Z71_TAGRF = @bagTag AND Z71_LOTECTL=@bagLote`
        //const sqlDelLocal = `DELETE FROM Z71010 WHERE Z71_TAGRF = @BagTag AND Z71_LOTECTL = @bagLote`
        const sqlDelLocal = `UPDATE Z71010 SET Z71_SEQLOT = 99 WHERE Z71_TAGRF = @BagTag AND Z71_LOTECTL = @bagLote`
        const sqlDelNet = `UPDATE Z71010 SET D_E_L_E_T_='*', Z71_EMBAL = 'WMSDEL' WHERE Z71_TAGRF = @BagTag AND Z71_LOTECTL = @bagLote`
        const cRet = await executeQueryLocal(sqlCons,{bagTag, bagLote}) 
        let lDelLocal = ""
        let lDelNet = ""

        if(cRet.recordset.trim().length>0){
            //Deletando o registro da tabela Z71 do banco de dados do 213
            lDelLocal = await executeQueryLocal(sqlDelLocal, {bagTag, bagLote})
            lDelNet = await executeQueryNet(sqlDelNet, {bagTag, bagLote})
            return new Retorno({
                code: 600,
                type:"Dados excluídos",
                message:"Dados excluídos com sucesso!"
            })
        } else {
            return new Retorno({
                code:500,
                type:"Error",
                message:"Registro não encontrado, verifique"
            })
        }
    } catch (error) {

    }
}