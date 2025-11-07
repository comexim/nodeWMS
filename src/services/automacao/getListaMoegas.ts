import Retorno from "../../models/automacao/Retorno";
import WMS_EnderecoDTO from "../../models/automacao/WMS_EnderecoDTO";
import { executeQueryLocal } from "../../utils/dbExecute"

export async function getListaMoegas () {
    const sql = `SELECT EnderCod, EnderTag, E.BagLote, E.BagTag, EnderBloco, EnderQuadra, EnderPosicao, EnderNivel, EnderLinha, EnderTipo, EnderStatus, E.EnderX1, E.EnderY1, E.EnderX2, E.EnderY2,
                    ISNULL(BagKgAtu,0) AS BagKgAtu, ISNULL(BagScAtu,0) AS BagScAtu, ISNULL(BagLinha,'') AS BagLinha, ISNULL(BagPen17,0) AS BagPen17, ISNULL(BagPen14,0) AS BagPen14, ISNULL(BagPVA,0) AS BagPVA, ISNULL(BagGrinder,0) AS BagGrinder, ISNULL(BagImpureza,0) AS BagImpureza, ISNULL(BagSafra,'') as BagSafra
                        FROM WMS_Endereco E LEFT JOIN WMS_Bag B ON E.EnderCod = B.BagAtuEnder
                    WHERE EnderTipo IN ('MOEGA')
                ORDER BY EnderCod`
    try {
        const response = await executeQueryLocal(sql);

        const listEnder: WMS_EnderecoDTO[] = response.recordset.map((item: any) => {
            const enderDTO = new WMS_EnderecoDTO();
            enderDTO.enderCod = item.EnderCod;
            enderDTO.enderTag = item.EnderTag;
            enderDTO.bagLote = item.BagLote;
            enderDTO.enderBloco = item.EnderBloco;
            enderDTO.enderQuadra = item.EnderQuadra;
            enderDTO.enderPosicao = item.EnderPosicao;
            enderDTO.enderNivel = item.EnderNivel;
            enderDTO.enderLinha = item.EnderLinha;
            enderDTO.enderTipo = item.EnderTipo;
            enderDTO.enderStatus = item.EnderStatus;
            enderDTO.peso = item.BagKgAtu;
            enderDTO.sacas = item.BagScAtu;
            enderDTO.linha = item.BagLinha;
            enderDTO.pen17 = item.BagPen17;
            enderDTO.pen14 = item.BagPen14;
            enderDTO.pva = item.BagPVA;
            enderDTO.grinder = item.BagGrinder;
            enderDTO.impureza = item.BagImpureza;
            enderDTO.safra = item.BagSafra;
            enderDTO.enderX1 = item.EnderX1;
            enderDTO.enderY1 = item.EnderY1;
            enderDTO.enderX2 = item.EnderX2;
            enderDTO.enderY2 = item.EnderY2;
            return enderDTO;
        })
        return listEnder;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno (getListaMoegas): ${error}`
        })
    }
}