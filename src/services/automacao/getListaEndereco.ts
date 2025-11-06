import Retorno from "../../models/automacao/Retorno";
import WMS_EnderecoDTO from "../../models/automacao/WMS_EnderecoDTO";
import { executeQueryLocal, getEmpenhoLote } from "../../utils/dbExecute";

export async function getListaEndereco (bloco: string, quadra: string, posicao: string, status: string) {
    let empenho: string[] = ["Não","0",""];

    let sql = `SELECT EnderCod, EnderTag, E.BagLote, E.BagTag, EnderBloco, EnderQuadra, EnderPosicao, EnderNivel, EnderLinha, EnderTipo, EnderStatus, E.EnderX1, E.EnderY1, E.EnderX2, E.EnderY2,
                    ISNULL(BagKgAtu,0) AS BagKgAtu, ISNULL(BagScAtu,0) AS BagScAtu, ISNULL(BagLinha,'') AS BagLinha, ISNULL(BagPen17,0) AS BagPen17, ISNULL(BagPen14,0) AS BagPen14, ISNULL(BagPVA,0) AS BagPVA, ISNULL(BagGrinder,0) AS BagGrinder, ISNULL(BagImpureza,0) AS BagImpureza, ISNULL(BagSafra,'') as BagSafra
                    FROM WMS_Endereco E LEFT JOIN WMS_Bag B ON E.EnderCod = B.BagAtuEnder
                    WHERE EnderTipo IN ('PISO', 'MOEGA') `;

    if(status?.trim().length > 0) {
        sql += ` AND EnderStatus = @status`;
    }

    if(bloco?.trim().length > 0) {
        sql += ` AND EnderBloco = @bloco`;
    }

    if(quadra?.trim().length > 0) {
        sql += ` AND EnderQuadra = @quadra`;
    }

    if(posicao?.trim().length > 0) {
        sql += ` AND EnderPosicao = @posicao`
    }

    sql += " ORDER BY EnderCod";
    try {
        const result = await executeQueryLocal(sql, { status, bloco, quadra, posicao });

        const listEnder: WMS_EnderecoDTO[] = await Promise.all (
            result.recordset.map(async (item: any) => {
                const enderDto = new WMS_EnderecoDTO();
                enderDto.enderCod = item.EnderCod;
                enderDto.enderTag = item.EnderTag;
                enderDto.bagLote = item.BagLote;
                enderDto.enderBloco = item.EnderBloco;
                enderDto.enderQuadra = item.EnderQuadra;
                enderDto.enderPosicao = item.EnderPosicao;
                enderDto.enderNivel = item.EnderNivel;
                enderDto.enderLinha = item.EnderLinha;
                enderDto.enderTipo = item.EnderTipo;
                enderDto.enderStatus = item.EnderStatus;
                enderDto.peso = item.BagAtuEnder;
                enderDto.sacas = item.BagScAtu;
                enderDto.linha = item.BagLinha;
                enderDto.pen17 = item.BagPen17;
                enderDto.pen14 = item.BagPen14;
                enderDto.pva = item.BagPva;
                enderDto.grinder = item.BagGrinder;
                enderDto.impureza = item.BagImpureza;
                enderDto.safra = item.bagSafra;
                enderDto.enderX1 = item.EnderX1;
                enderDto.enderY1 = item.EnderY1;
                enderDto.enderX2 = item.EnderX2;
                enderDto.enderY2 = item.EnderY2;
                if(item.BagLote?.trim().length > 0) {
                    empenho = await getEmpenhoLote(item.BagLote);
                }
                enderDto.empSN = empenho?.[0] ?? "Não";
                enderDto.empPeso = empenho?.[1] ?? "0";
                enderDto.osNum = empenho?.[2] ?? "";
                return enderDto;
            })
        )
        return listEnder;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno (getListaEndereço): ${error}`
        })
    }
}