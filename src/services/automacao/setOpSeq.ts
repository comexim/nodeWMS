import Retorno from "../../models/automacao/Retorno";
import WMS_SeqOpDTO from "../../models/automacao/WMS_SeqOpDTO";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function setOpSeq(dados: WMS_SeqOpDTO) {
    try{
        const sql = `
                SELECT ISNULL(MAX(SeqOpID), 0) + 1 as novoID
                FROM WMS_SeqOP;
        `
        const ultimoRegistro = await executeQueryLocal(sql);
        const novoSeqOpID = ultimoRegistro.recordset[0].novoID;

        const sqlAux = `
                    INSERT INTO WMS_SeqOP (
                        SeqOpID, 
                        SeqOpNum, 
                        SeqOpLote, 
                        SeqOpPeneira, 
                        SeqOpServico, 
                        SeqOpPeso, 
                        SeqOpSacas, 
                        SeqOpBags, 
                        SeqOpDestino, 
                        SeqOpData, 
                        SeqOpHora, 
                        SeqOpStatus 
                    ) VALUES (
                        @seqOpID,
                        @seqOpNum,
                        @seqOpLote,
                        @seqOpPeneira,
                        @seqOpServico,
                        @seqOpPeso,
                        @seqOpSacas,
                        @seqOpBags,
                        @seqOpDestino,
                        @seqOpData,
                        @seqOpHora,
                        @seqOpStatus
                    ) 
        `

        const params = {
            seqOpID: novoSeqOpID,
            seqOpNum: dados.seqOpNum,
            seqOpLote: dados.seqOpLote,
            seqOpPeneira: dados.seqOpPeneira,
            seqOpServico: dados.seqOpServico,
            seqOpPeso: dados.seqOpPeso,
            seqOpSacas: dados.seqOpSacas,
            seqOpBags: dados.seqOpBags,
            seqOpDestino: dados.seqOpDestino,
            seqOpData: dados.seqOpData,
            seqOpHora: dados.seqOpHora,
            seqOpStatus: dados.seqOpStatus
        }

        await executeQueryLocal(sqlAux, { params })

        return new Retorno ({
            code: 601,
            type: "OK",
            message: "Registro inserido com sucesso!"
        })

    } catch (error) {
        return new Retorno ({
            code: 501,
            type: "Error",
            message: `Erro: ${error}`
        })
    }
}