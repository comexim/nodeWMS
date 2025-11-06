import { executeQueryLocal, getListaEmpenhoOS } from "../../utils/dbExecute";
import WMS_EnderColorDTO from "../../models/automacao/WMS_EnderColorDTO";
import Retorno from "../../models/automacao/Retorno";

export async function getEnderColor (params: any) {
    let sql = `SELECT E.EnderCod, E.EnderBloco, E.EnderQuadra, E.EnderPosicao, E.EnderNivel, E.EnderTipo, E.EnderTag, ISNULL(B.BagLote,'') AS BagLote, E.EnderStatus, E.EnderNivel, E.EnderX1, E.EnderY1, E.EnderX2, E.EnderY2, E.EnderWebX1, E.EnderWebY1, E.EnderWebX2, E.EnderWebY2,
                    ISNULL(BagKgAtu,0) AS BagKgAtu, ISNULL(BagScAtu,0) AS BagScAtu, ISNULL(BagLinha,'') AS BagLinha, ISNULL(BagPen17,0) AS BagPen17, ISNULL(BagPen14,0) AS BagPen14, ISNULL(BagPVA,0) AS BagPVA, ISNULL(BagGrinder,0) AS BagGrinder, ISNULL(BagImpureza,0) AS BagImpureza, ISNULL(BagSafra,'') as BagSafra, E.BagLote as Lote,
                    (SELECT Count(EnderStatus) AS TOT FROM WMS_Endereco EnderB WHERE (EnderB.EnderStatus = 'LV' OR EnderB.EnderStatus = 'EM' ) AND Enderb.EnderBloco = E.EnderBloco AND EnderB.EnderQuadra = E.EnderQuadra AND EnderB.EnderPosicao = E.EnderPosicao) as totLivre,
                    (SELECT Count(EnderCod) AS TOT FROM WMS_Endereco EnderB WHERE Enderb.EnderBloco = E.EnderBloco AND EnderB.EnderQuadra = E.EnderQuadra AND EnderB.EnderPosicao = E.EnderPosicao) as totAlto
                    FROM WMS_Endereco E LEFT JOIN WMS_Bag B ON E.EnderCod = B.BagAtuEnder
                    WHERE E.EnderTipo IN ('PISO','MOEGA')`;

    let lotesIn = "";

    let lCorSelecao = false;

    if(params.op.trim().length > 0) {
        //Buscando o empenho da OP
        let listaSD4 = getListaEmpenhoOS(params.os);

        //Vejo se listaSD4 me retorna um array, e busco o endereço de cada lote da OP
        if (Array.isArray(listaSD4) && params.op.trim().length > 0) {
            for(let i = 0; i < listaSD4.length; i++) {
                lotesIn += listaSD4[i].lote.trim()+"','";
            }

            if(lotesIn.trim().length > 0) {
                lotesIn = lotesIn.substring(0, lotesIn.length - 2) + ")";
                sql += ` AND B.BagTag IN (@lotesIn`
            } else {
                sql += ` AND 1=2`
            }

            lCorSelecao = true;
        } 
    }

    if(params.lote && params.lote.trim().length > 0) {
        lCorSelecao = true;
        sql += ` AND B.BagLote LIKE '%' + @lote + '%'`;
    }

    if(params.linha && params.linha.trim().length > 0) {
        if(params.linha.trim() !== "Todos") {
            lCorSelecao = true;
            sql += ` AND B.BagLinha IN (@linha)`;
        }
    }

    if(params.graudo && params.graudo.trim() === "True" || params.mtgb && params.mtgb.trim() === "True" || params.grinder && params.grinder.trim() === "True" || params.pva && params.pva.trim() === "True") {
        sql += ` AND (`
        if(params.graudo && params.graudo.trim() === "True") {
            lCorSelecao = true;
            sql += `B.BagPen17 > 0 OR `;
        }
        if(params.mtgb && params.mtgb.trim() === "True") {
            lCorSelecao = true;
            sql += ` B.BagPen14 > 0 OR `;
        }
        if(params.grinder && params.grinder.trim() === "True") {
            lCorSelecao = true;
            sql += ` B.BagGrinder > 0 OR `;
        }
        if(params.pva && params.pva.trim() === "True") {
            lCorSelecao = true;
            sql += ` B.BagPva > 0 OR `;
        }
        sql += `1=2 )`;
    }

    if(params.safra && params.safra.trim().length > 0) {
        lCorSelecao = true;
        sql += ` AND B.BagSafra = @safra`;
    }
    
    if(params.endereco && params.endereco.trim().length > 0) {
        lCorSelecao = true;
        sql += ` AND E.EnderCod LIKE '%' + @endereco + '%'`;
    }
    
    if(params.tagBag && params.tagBag.trim().length > 0) {
        lCorSelecao = true;
        sql += ` AND B.BagTag LIKE '%' + @tagBag + '%'`;
    }

    sql += ` ORDER BY E.EnderBloco, E.EnderQuadra, E.EnderPosicao, E.EnderNivel`;
        
    try {
        const response = await executeQueryLocal(sql, params);
       
        const listaEnder: WMS_EnderColorDTO[] = response.recordset.map((item: any) => {
            const ender = new WMS_EnderColorDTO();
            ender.enderCod = item.EnderCod;
            ender.enderTag = item.EnderTag;
            ender.enderX1 = item.EnderX1;
            ender.enderY1 = item.EnderY1;
            ender.enderX2 = item.EnderX2;
            ender.enderY2 = item.EnderY2;
            ender.enderWebX1 = item.EnderWebX1;
            ender.enderWebY1 = item.EnderWebY1;
            ender.enderWebX2 = item.EnderWebX2;
            ender.enderWebY2 = item.EnderWebY2;
            ender.bagLote = item.Lote;
            ender.enderSacas = String(item.BagScAtu);
            ender.enderStatus = item.EnderStatus;
            ender.cor = "0,0,0"; //Preto

            if(lCorSelecao) {
                ender.cor = "0,0,0";
            } else {
                if(item.EnderTipo === "MOEGA") {
                    ender.cor = "0,0,0"; //Preto
                } else {
                    if(item.EnderStatus === "BQ") {
                        ender.cor = "255,0,127"; //Rosa
                    } else {
                        if(item.EnderStatus === "OC") {
                            ender.cor = "255,0,0"; //Vermelho
                        } else {
                            if(item.totAlto > 0) {
                                if(item.totAlto === item.totLivre) {
                                    ender.cor = "0,255,0"; //Tudo livre, verde
                                } else {
                                    //Para posições com 4 de alto
                                    if(item.totAlto === 4) {
                                        if(item.totLivre === 3) {
                                            ender.cor = "255,255,0"; //Amarelo
                                        } else {
                                            if(item.totLivre === 2) {
                                                ender.cor = "255,128,0";
                                            } else {
                                                if(item.totLivre === 1) {
                                                    ender.cor = "128,0,255";
                                                }
                                            }
                                        }
                                    } else {
                                        if(item.totLivre === 2) {
                                            ender.cor = "255,128,0"; //Laranja
                                        } else {
                                            if(item.totLivre === 1) {
                                                ender.cor = "128,0,255";
                                            }
                                        }
                                    }
                                }
                                if(item.totLivre === 0) {
                                    ender.cor = "255,0,0" //Vermelho
                                }
                             }
                        }
                    }
                }
            }
            return ender;
        })

        return listaEnder;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno (getEnderColor): ${error}`
        })
    }
}