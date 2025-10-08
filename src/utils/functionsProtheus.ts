import LS_Compras from "../models/protheus/LS_Compras";
import LS_ComprasAFX from "../models/protheus/LS_ComprasAFX";
import LS_Consignado from "../models/protheus/LS_Consignado";
import LS_Estoque from "../models/protheus/LS_Estoque";
import LS_LoteBolsa from "../models/protheus/LS_LoteBolsa";
import LS_Vendas from "../models/protheus/LS_Vendas";
import MsgRetorno from "../models/protheus/MsgRetorno";
import { formatDate, formatNumberToBrazil } from "./dateFormat";
import { executeQueryNet } from "./dbExecute";

export async function getEstoqueLongShort(tipo: string): Promise<LS_Estoque[] | MsgRetorno> {
    let sql = "";
    let count = 1;

    // ---------- PRIMEIRO SELECT (SB8010) ----------
    if (tipo === "all" || tipo === "ext" || tipo === "cusa" || tipo === "ceu") {
        sql += `
            SELECT
                B8_FILIAL AS FILIAL, B8_PRODUTO AS PRODUTO, B8_LOCAL AS LOCAL, B8_LOTECTL AS LOTECTL,
                ISNULL((SELECT TOP 1 NNR_DESCRI FROM NNR010 WHERE D_E_L_E_T_ <> '*' AND NNR_FILIAL = B8_FILIAL AND NNR_CODIGO = B8_LOCAL),'') AS LOCALDESCR,
                ISNULL((SELECT TOP 1 NNR__CIDAD FROM NNR010 WHERE D_E_L_E_T_ <> '*' AND NNR_FILIAL = B8_FILIAL AND NNR_CODIGO = B8_LOCAL),'') AS CIDADEDESCR,
                B8_ORIGLAN AS ORIGLAN, B8_DATA AS DATA, B8__TPCAFE AS TPCAFE, B8__SAFRA AS SAFRA, B8__RENDA AS RENDA, B8__PVA AS PVA,
                B8__QUEBRA AS QUEBRA, B8__DEFEIT AS DEFEIT, B8__GRINDE AS GRINDE, B8__IMPUKG AS IMPUKG, B8__IMPURE AS IMPURE, 
                B8_SALDO AS SALDO, B8_EMPENHO AS EMPENHO, B8__PEDIDO AS PEDIDO, B8__CLASSI AS CLASSI, B8__VOLS AS VOLS, 
                B8__CONSIG AS CONSIG, B8__PEN14 AS PEN14, B8__PEN17 AS PEN17, B8__DIFERE AS DIFERE, B8__PEN AS PEN,
                B8__BEB AS BEB, B8__COR AS COR, B8__LINCAF AS LINCAF,
                CAST(ROUND(((B8_SALDO) * ((B8__RENDA) / 100) *
                    (CASE WHEN (B8__PVA + B8__QUEBRA + B8__IMPURE + B8__FUNDO) > 100 
                          THEN 100 ELSE (B8__PVA + B8__QUEBRA + B8__IMPURE + B8__FUNDO) END) 
                    / 100 / 59), 4, 1) AS DECIMAL(12,4)) AS cons,
                CAST(ROUND(((B8_SALDO) * ((B8__RENDA) / 100) *
                    (CASE WHEN (100 - B8__PVA - B8__QUEBRA - B8__IMPURE - B8__FUNDO) < 0 
                          THEN 0 ELSE (100 - B8__PVA - B8__QUEBRA - B8__IMPURE - B8__FUNDO) END) 
                    / 100 / 59), 4, 1) AS DECIMAL(12,4)) AS exp
            FROM SB8010 SB8
            WHERE (SB8.D_E_L_E_T_ <> '*')
              AND (SB8.B8_LOCAL <> '50')
              AND (SB8.B8_SALDO > 0.01)
              AND (SB8.B8_PRODUTO IN ('00100','00101'))
        `;

        if (tipo === "cusa") {
            sql += ` AND (SB8.B8_FILIAL IN ('60'))`;
        } else if (tipo === "ceu") {
            sql += ` AND (SB8.B8_FILIAL IN ('61'))`;
        } else {
            sql += ` AND (SB8.B8_FILIAL IN ('02','05','10','11','15','16','19','20'))`;
        }

        if (tipo === "ext") {
            sql += ` AND SB8.B8_LOCAL >= '60' AND SB8.B8_LOCAL <= '99'`;
        }
    }

    // ---------- SEGUNDO SELECT (SC7010) ----------
    if (tipo === "all") {
        sql += " UNION ";
    }

    if (tipo === "all" || tipo === "tra") {
        sql += `
            SELECT
                C7_FILIAL AS FILIAL, C7_PRODUTO AS PRODUTO, C7_LOCAL AS LOCAL, C7_NUM AS lotectl,
                ISNULL((SELECT NNR_DESCRI FROM NNR010 WHERE D_E_L_E_T_ <> '*' AND NNR_FILIAL = C7_FILIAL AND NNR_CODIGO = C7_LOCAL),'') AS localdescr,
                ISNULL((SELECT NNR__CIDAD FROM NNR010 WHERE D_E_L_E_T_ <> '*' AND NNR_FILIAL = C7_FILIAL AND NNR_CODIGO = C7_LOCAL),'') AS cidadedescr,
                'TRANSIT' AS origlan, C7_EMISSAO AS data, '' AS tpcafe,
                C7__SAFRA AS safra, C7__RENDA AS renda, C7__PVA AS pva, C7__QUEBRA AS quebra, C7__DEFEIT AS defeit, C7__GRINDE AS grinde, C7__IMPUKG AS impukg,
                C7__IMPURE AS impure, C7_QUANT AS saldo, 0 AS empenho, C7_NUM AS pedido, C7__CLASSI AS classi, 
                0.00 AS vols, '' AS consig, C7__PEN14 AS pen14, C7__PEN17 AS pen17, C7__DIFERE AS difere, 
                C7__PEN AS pen, C7__BEB AS beb, '' AS cor, C7__LINCAF AS lincaf,
                CAST(ROUND(((C7_QUANT - C7_QUJE) * C7__RENDA / 100 *
                    (CASE WHEN (C7__PVA + C7__QUEBRA + C7__IMPURE) > 100 
                          THEN 100 ELSE (C7__PVA + C7__QUEBRA + C7__IMPURE) END) 
                    / 100 / 59), 4, 1) AS DECIMAL(12,4)) AS cons,
                CAST(ROUND(((C7_QUANT - C7_QUJE) * C7__RENDA / 100 *
                    (CASE WHEN (100 - C7__PVA - C7__QUEBRA - C7__IMPURE) < 0 
                          THEN 0 ELSE (100 - C7__PVA - C7__QUEBRA - C7__IMPURE) END) 
                    / 100 / 59), 4, 1) AS DECIMAL(12,4)) AS exp
            FROM SC7010 SC7
            WHERE (SC7.D_E_L_E_T_ = ' ')
              AND (SC7.C7_FILIAL IN ('02','05','10','11','15','16','19','20'))
              AND (SC7.C7_LOCAL <> '50')
              AND (SC7.C7_FORNECE IN('58150087'))
              AND (SC7.C7_QUANT - SC7.C7_QUJE > 0)
              AND (SC7.C7__TPCMP <> 'TRA')
              AND (SC7.C7_RESIDUO != 'S')
        `;
    }

    //console.log("SQL Final:", sql);

    const response = await executeQueryNet(sql);

    const lst: LS_Estoque[] = [];
    for (const item of response.recordset) {
        const dto = {
            rec: count++,
            filial: item.FILIAL?.trim(),
            produto: item.PRODUTO?.trim() || "",
            local: item.LOCAL?.trim() || "",
            localDescr: item.LOCALDESCR?.trim() || "",
            cidadeDescr: item.CIDADEDESCR?.trim() || "",
            lotectl: item.LOTECTL?.trim() || "",
            origlan: item.ORIGLAN?.trim() || "",
            data: formatDate(item.DATA?.trim() || "", "dma"),
            tpcafe: item.TPCAFE?.trim() || "",
            safra: item.SAFRA?.trim() || "",
            renda: item.RENDA || 0,
            pva: item.PVA || 0,
            quebra: item.QUEBRA || 0,
            defeit: item.DEFEIT || 0,
            grinde: item.GRINDE || 0,
            impukg: item.IMPUKG || 0,
            impure: item.IMPURE || 0,
            saldo: item.SALDO || 0,
            empenho: item.EMPENHO || 0,
            pedido: item.PEDIDO?.trim() || "",
            classi: item.CLASSI?.trim() || "",
            vols: item.VOLS || 0,
            consig: item.CONSIG?.trim() || "",
            pen14: item.PEN14 || 0,
            pen17: item.PEN17 || 0,
            difere: item.DIFERE || 0,
            //pen: item.PEN?.trim() || "",
            pen: "...",
            beb: item.BEB?.trim() || "",
            cor: item.COR?.trim() || "",
            lincaf: item.LINCAF?.trim() || "",
            cons: String(item.cons || ""),
            exp: String(item.exp || ""),
        };
        lst.push(dto);
    }

    if (lst.length > 0) {
        return lst;
    } else {
        return new MsgRetorno({
            codRet: "500",
            descrRet: "Sem dados (getEstoqueLongShort)"
        });
    }
}


//Remove pontos dos milhares e troca vírgula por ponto
export async function parseNumber(str: string | number): Promise<number> {
    if (typeof str === "number") return str;
    if (!str) return 0;
    return Number(str.replace(/\./g, "").replace(",","."));
}

export async function roundDouble(value: number, decimals: number): Promise<number> {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

export async function getComprasLongShort(tipo: string): Promise<LS_Compras[] | MsgRetorno> {
    try {
           let sql = ""
           let count = 1;

    if(tipo === "all" || tipo === "sol") {
        sql += `SELECT '05' AS FILIAL, 'SC1' AS TIPO, SC1.C1_NUM AS NUM, SC1.C1_NUM AS NUMSC, SC1.C1__CRTORA AS FORNECE, SC1.C1__FILCOR AS LOJA, SC1.C1_PRODUTO AS PRODUTO, SC1.C1__TPCAFE AS TIPOCF,
        SC1.C1__LINCAF AS LINHA, SC1.C1__RENDA AS RENDA, SC1.C1__PVA AS PVA, SC1.C1__GRINDE AS GRINDE, SC1.C1__QUEBRA AS QUEBRA, SC1.C1__IMPURE AS IMPURE, SC1.C1__IMPUKG AS IMPUKG,
        SC1.C1_QUANT AS QUANT, SC1.C1_QTSEGUM AS QSEGUN, SC1.C1_QUJE AS QUJE, SC1.C1__TPCMP AS TPCMP,
        SC1.C1__CSTTT AS CSTTT, SC1.C1__CSTSC AS CSTSC, SC1.C1__CSTUN AS CSTUN,
        SC1.C1__NMCRTA AS NOMEFOR,
        SC1.C1__CERTIF AS CERTIF, SC1.C1__DIFERE AS DIFER,
        SC1.C1__PEN14 AS PEN14, SC1.C1__PEN17 AS PEN17,
        SC1.C1_EMISSAO AS EMISSAO,
        CAST(ROUND( ((SC1.C1_QUANT - SC1.C1_QUJE) * SC1.C1__RENDA / 100) * ((SC1.C1__PVA + SC1.C1__QUEBRA + SC1.C1__IMPURE) / 100) / 59, 4, 1) AS DECIMAL(12,4)) AS CONS,
        CAST(ROUND( ((SC1.C1_QUANT - SC1.C1_QUJE) * SC1.C1__RENDA / 100) * ((100 - SC1.C1__PVA - SC1.C1__QUEBRA - SC1.C1__IMPURE) / 100) / 59, 4, 1) AS DECIMAL(12,4)) AS EXP
        FROM SC1010 SC1
        WHERE (SC1.D_E_L_E_T_ != '*')
        and (SC1.C1_MSFIL In ('02','05','10','11','15','19','20'))
        and ((SC1.C1_QUANT - SC1.C1_QUJE)/59 > 1)
        and (100 - (SC1.C1_QUJE * 100 / SC1.C1_QUANT)) > 1
        and (SC1.C1_PRODUTO IN ('00100','00101'))
        and (SC1.C1_RESIDUO != 'S')
        and (SC1.C1__STATUS != 'C')
        and (SC1.C1__CONSIG != 'S')`;
    }

    if (tipo === "all") {
        sql += " UNION "
    }

    if(tipo === "all" || tipo === "ped") {
        
        sql += `SELECT SC7.C7_FILIAL AS FILIAL, 'SC7' AS TIPO, SC7.C7_NUM AS NUM, SC7.C7_NUMSC AS NUMSC, SC7.C7_FORNECE AS FORNECE, SC7.C7_LOJA AS LOJA,  SC7.C7_PRODUTO AS PRODUTO, SC7.C7__TPCAFE AS TIPOCF,
        SC7.C7__LINCAF AS LINHA, SC7.C7__RENDA AS RENDA, SC7.C7__PVA AS PVA, SC7.C7__GRINDE AS GRINDE, SC7.C7__QUEBRA AS QUEBRA, SC7.C7__IMPURE AS IMPURE, SC7.C7__IMPUKG AS IMPUKG,
        SC7.C7_QUANT AS QUANT, SC7.C7_QTSEGUM AS QSEGUN, SC7.C7_QUJE AS QUJE, SC7.C7__TPCMP AS TPCMP,
        SC7.C7_TOTAL AS CSTTT, SC7.C7__CSTSC AS CSTSC, SC7.C7_PRECO AS CSTUN,
        (SELECT TOP 1 A2_NREDUZ FROM SA2010 WHERE A2_FILIAL = C7_FILIAL AND C7_FORNECE = A2_COD AND A2_LOJA = C7_LOJA AND SA2010.D_E_L_E_T_<>'*') AS NOMEFOR,
        SC7.C7__CERTIF AS CERTIF, SC7.C7__DIFERE AS DIFER, SC7.C7__PEN14 AS PEN14, SC7.C7__PEN17 AS PEN17,
        (Select TOP 1 C1_EMISSAO From SC1010 SC1 Where (SC1.D_E_L_E_T_ != '*' and SC1.C1_NUM = SC7.C7_NUMSC and SC1.C1_ITEM = SC7.C7_ITEMSC)) AS EMISSAO,
        CAST(ROUND( ((SC7.C7_QUANT - SC7.C7_QUJE) * SC7.C7__RENDA / 100) * ((SC7.C7__PVA + SC7.C7__QUEBRA + SC7.C7__IMPURE) / 100) / 59, 4, 1) AS DECIMAL(12,4)) AS CONS,
        CAST(ROUND( ((SC7.C7_QUANT - SC7.C7_QUJE) * SC7.C7__RENDA / 100) * ((100 - SC7.C7__PVA - SC7.C7__QUEBRA - SC7.C7__IMPURE) / 100) / 59, 4, 1) AS DECIMAL(12,4)) AS EXP
        FROM SC7010 SC7
        WHERE (SC7.D_E_L_E_T_ != '*')
        and ((SC7.C7_QUANT - SC7.C7_QUJE)/59 > 1)
        and (100 - (SC7.C7_QUJE * 100 / SC7.C7_QUANT)) > 1
        and (SC7.C7_RESIDUO != 'S')
        and not (SC7.C7_FORNECE like '%58150087%')
        and (SC7.C7_PRODUTO IN ('00100','00101'))
        and (SC7.C7__STATUS != 'C')
        and (SC7.C7__CONSIG != 'S')
        and (SC7.C7_FILIAL In ('02','05','10','11','15','19','20'))`
    }

    const response = await executeQueryNet(sql);
    
const lst: LS_Compras[] = [];
for (const item of response.recordset) {
    const dto = {
        rec: count++,
        filial: item.FILIAL?.trim() || "",
        tipo: item.TIPO?.trim() || "",
        num: item.NUM?.trim() || "",
        numsc: item.NUMSC?.trim() || "",
        fornece: item.FORNECE?.trim() || "",
        loja: item.LOJA?.trim() || "",
        produto: item.PRODUTO?.trim() || "",
        tipocf: item.TIPOCF?.trim() || "",
        linha: item.LINHA?.trim() || "",
        renda: item.RENDA || 0,
        pva: item.PVA || 0,
        grinde: item.GRINDE || 0,
        quebra: item.QUEBRA || 0,
        impure: item.IMPURE || 0,
        impukg: item.IMPUKG || 0,
        quant: item.QUANT || 0,
        qsegun: item.QSEGUN || 0,
        quje: item.QUJE || 0,
        tpcmp: item.TPCMP?.trim() || "",
        csttt: item.CSTTT || 0,
        cstsc: item.CSTSC || 0,
        cstun: item.CSTUN || 0,
        nomefor: item.NOMEFOR?.trim() || "",
        certif: item.CERTIF?.trim() || "",
        difer: item.DIFER || 0,
        pen14: item.PEN14 || 0,
        pen17: item.PEN17 || 0,
        emissao: formatDate(item.EMISSAO?.trim() || "", "dma"),
        cons: item.CONS || 0,
        exp: item.EXP || 0,
    };
    lst.push(dto);
}

    if(lst.length > 0){
        return lst;
    } else {
        return new MsgRetorno ({
            codRet: "501",
            descrRet: "Sem dados (getComprasLongShort)"
        })
    }
    } catch (error) {
        return new MsgRetorno ({
            codRet: "501",
            descrRet: `Erro interno no getComprasLongShort`
        })
    }

    
}

export async function getComprasAFXLongShort(): Promise <LS_ComprasAFX[] | MsgRetorno> {
    const sql = `SELECT SC1.C1_NUM AS NUM, SC1.C1_EMISSAO AS EMISSAO, SC1.C1__NMCRTA AS CORRETORA, SC1.C1__LINCAF AS LINHA,
    SC1.C1__RENDA AS RENDA, SC1.C1__PVA AS PVA, SC1.C1__GRINDE AS GRINDER, SC1.C1__QUEBRA AS QUEBRA, SC1.C1__IMPURE AS IMPURE,
    SC1.C1__CSTTT AS CSTT, SC1.C1__CSTSC AS CSTSC, SC1.C1__CSTUN AS CSTUN, SC1.C1__DOLAR AS DOLAR,
    SC1.C1__BOLSA AS BOLSA, SC1.C1__DIFERE AS DIFERE, SC1.C1__COTSC AS COTSC,
    SC1.C1__PEN14 AS PEN14, SC1.C1__PEN17 AS PEN17,
    (SUM(CAST(ROUND( (Z77.Z77_QTDSC * SC1.C1__RENDA / 100) *
    ((100 - SC1.C1__PVA - SC1.C1__QUEBRA - SC1.C1__IMPURE) / 100) , 4, 1) AS DECIMAL(12,4))))  AS FIXADAS,
    (SUM(CAST(ROUND( (SC1.C1_QUANT * SC1.C1__RENDA / 100) *
    ((100 - SC1.C1__PVA - SC1.C1__QUEBRA - SC1.C1__IMPURE) / 100) , 4, 1) AS DECIMAL(12,4))))  AS QUANT,
    (SUM(CAST(ROUND( (SC1.C1_QUANT * SC1.C1__RENDA / 100) *
    ((100 - SC1.C1__PVA - SC1.C1__QUEBRA - SC1.C1__IMPURE) / 100) / 59, 4, 1) AS DECIMAL(12,4))))  AS SACAS
    From SC1010 SC1 LEFT JOIN Z77010 Z77 ON Z77.D_E_L_E_T_ <> '*' AND Z77.Z77_NUMSC = SC1.C1_NUM
    Where (SC1.D_E_L_E_T_ != '*')
    and (SC1.C1_MSFIL In ('02','05','10','11','15','19','20'))
    and (SC1.C1_PRODUTO IN ('00100','00101'))
    and (SC1.C1_RESIDUO != 'S')
    and (SC1.C1__STATUS != 'C')
    and (SC1.C1__CONSIG != 'S')
    AND SC1.C1__TPCMP = 'AFX'
    AND SC1.C1__COTSC = 0
    GROUP BY SC1.C1_MSFIL, SC1.C1_NUM, SC1.C1_EMISSAO, SC1.C1__NMCRTA, SC1.C1__LINCAF,
    SC1.C1__RENDA, SC1.C1__PVA, SC1.C1__GRINDE, SC1.C1__QUEBRA, SC1.C1__IMPURE,
    SC1.C1__CSTTT, SC1.C1__CSTSC, SC1.C1__CSTUN, SC1.C1__DOLAR,
    SC1.C1__BOLSA, SC1.C1__DIFERE, SC1.C1__COTSC,
    SC1.C1__PEN14, SC1.C1__PEN17`;

    const response = await executeQueryNet(sql);
    const lst = response.recordset.map((item: any) => {
        const lowerCaseItem: any = {};
        Object.keys(item).forEach(key => {
            lowerCaseItem[key.toLowerCase()] = item[key];
        });
        return new LS_ComprasAFX(lowerCaseItem);
    });

    if(lst.length > 0){
        return lst;
    } else {
        return new MsgRetorno ({
            codRet: "501",
            descrRet: "Sem dados (getComprasAFXLongShort)"
        })
    }
}

export async function getVendasLongShort(tipo: string, vda: string): Promise<LS_Vendas[] | MsgRetorno> {
    let vQtdCtr = 0;
    let vEntCtr = 0;
    let vCons = 0;
    let vExp = 0;
    let count = 1;

    const cQuali = await getZ11Pcn();

    if(vda === null) {
        vda = "exp";
    }

    let sql = `Select ADA.ADA_FILIAL, ADA.ADA_CODCLI, ADA.ADA_LOJCLI, ADA.ADA_EMISSA, SA1.A1_NOME, SA1.A1_TIPO, ADA.ADA_STATUS, ADA.ADA_NUMCTR, ADA.ADA__LETRA, ADA.ADA__CTREX,
                ADA.ADA__DIFER, ADA.ADA__PRCFI, ADA.ADA__VLFIX, ADA.ADA__VLRUN, ADA.ADA__VLRTO, ADA.ADA__MESEM,
                ADA.ADA__PEN, ADA.ADA__BEB, ADA.ADA__PADRA, ADA.ADA__DESCC, ADA__MESFI, ADA__CRTDO, ADA__RESEL, ADA__FIXAC,
                ADA.ADA__PEN17, ADA.ADA__PEN14, ADA.ADA__GRIND, ADA.ADA__TPVDA,
                Sum(ADB.ADB_QUANT) as SUM_QTD,
                Sum(ADB.ADB_QTDENT) as SUM_ENT, QZ24.QTDFIX_SUM, QZ24.VLFIX_SUM
                From ADA010 ADA
                OUTER APPLY (
                    SELECT
                    Sum(Z24.Z24_QTDFIX) AS QTDFIX_SUM,
                    Sum(Z24.Z24_QTDFIX * Z24.Z24_VLFIX) / Sum(Z24.Z24_QTDFIX) AS VLFIX_SUM
                    From Z24010 Z24
                    Where (Z24.D_E_L_E_T_ != '*')
                    and (Z24.Z24_FILIAL  = ADA.ADA_FILIAL)
                    and (Z24.Z24_NUMCTR  = ADA.ADA_NUMCTR)
                ) AS QZ24 , ADB010 ADB, SA1010 SA1
                Where (ADA.D_E_L_E_T_ != '*')
                and (ADB.D_E_L_E_T_ != '*')
                and (SA1.D_E_L_E_T_ != '*')
                and (ADA.ADA_STATUS In ('B', 'C', 'D'))
                and (ADA.ADA__DESDO != 'S')
                and (ADA.ADA__TPVDA != 'C')
                and ADA.ADA__PADRA != ''`;

    if(vda === "exp") {
        sql += `and ADA.ADA__PADRA NOT IN (
                SELECT Z11_CODPRI FROM Z11010 WHERE
                D_E_L_E_T_ <> '*' AND
                Z11_TPCAD = 'PCN')`;
    } else if(vda === "cons") {
        sql += `and ADA.ADA__PADRA IN (
                SELECT Z11_CODPRI FROM Z11010 WHERE
                D_E_L_E_T_ <> '*' AND
                Z11_TPCAD = 'PCN')`;
    }

    sql += `and (ADB.ADB_FILIAL  = ADA.ADA_FILIAL)
            and (ADB.ADB_NUMCTR  = ADA.ADA_NUMCTR)
            and (SA1.A1_FILIAL   = ADA.ADA_FILIAL)
            and (SA1.A1_COD      = ADA.ADA_CODCLI)
            and (SA1.A1_LOJA     = ADA.ADA_LOJCLI)
            and (ADA.ADA_FILIAL In ('02','05','10','11','15','19','20'))`;

    if(tipo === "afx" || tipo === "afe") {
        sql += ` and ADA__PRCFI = 'A'
                 and ADA__VLFIX = 0`
    }

    if(tipo === "fxd") {
        sql += `and ((ADA__PRCFI = 'A' AND ADA__VLFIX > 0) OR (ADA__PRCFI = 'F'))
                and ADB_QTDENT < ADB_QUANT`
    }

    if(tipo === "fxdp") {
        sql += `and ADB_QTDENT < ADB_QUANT
                and (
                Select ISNULL(Sum(Z24.Z24_QTDFIX),0)
                From Z24010 Z24
                Where (Z24.D_E_L_E_T_ != '*')
                and (Z24.Z24_FILIAL  = ADA.ADA_FILIAL)
                and (Z24.Z24_NUMCTR  = ADA.ADA_NUMCTR)
                ) >0 and
                ADA__RESEL = '' and
                ADA__FIXPT = 'P'`;
    }

        sql += `
            GROUP BY 
                ADA.ADA_FILIAL, ADA.ADA_CODCLI, ADA.ADA_LOJCLI, ADA.ADA_EMISSA, 
                SA1.A1_NOME, SA1.A1_TIPO, ADA.ADA_STATUS, ADA.ADA_NUMCTR, ADA.ADA__LETRA, ADA.ADA__CTREX,
                ADA.ADA__DIFER, ADA.ADA__PRCFI, ADA.ADA__VLFIX, ADA.ADA__VLRUN, ADA.ADA__VLRTO, ADA.ADA__MESEM, ADB.ADB_CODPRO,
                ADA.ADA__PEN17, ADA.ADA__PEN14, ADA.ADA__GRIND, ADA.ADA__TPVDA,
                ADA.ADA__PESOS,
                ADA.ADA__DESCC,
                ADA.ADA__PEN, ADA.ADA__BEB, ADA.ADA__PADRA, ADA.ADA__MESFI, ADA.ADA__CRTDO, ADA.ADA__RESEL, ADA.ADA__FIXAC,
                QZ24.QTDFIX_SUM, QZ24.VLFIX_SUM
            ORDER BY 
                ADA.ADA_FILIAL, ADA.ADA__CTREX, ADA.ADA__LETRA
        `;

    const response = await executeQueryNet(sql);

    if (!response.recordset || response.recordset.length === 0) {
        return new MsgRetorno ({
            codRet: "502",
            descrRet: "Sem dados (getVendasLongShort)"
        });
    }

    const lst: LS_Vendas[] = [];
    for (const item of response.recordset) {
        vQtdCtr = item.SUM_QTD;
        vEntCtr = item.SUM_ENT;

        const dto = new LS_Vendas({
            rec: count++,
            filial: item.ADA_FILIAL?.trim(),
            codCli: item.ADA_CODCLI?.trim(),
            lojCli: item.ADA_LOJCLI?.trim(),
            emissao: formatDate(item.ADA_EMISSA?.trim(), "dma"),
            cliente: item.A1_NOME?.trim(),
            status: item.ADA_STATUS?.trim(),
            id: item.ADA_NUMCTR?.trim(),
            letra: item.ADA__LETRA?.trim(),
            numctr: typeof item.ADA__DIFER === "string" ? item.ADA__DIFER.trim() : String(item.ADA__DIFER ?? ""),
            difer: typeof item.ADA__DIFER === "string" ? item.ADA__DIFER.trim() : String(item.ADA__DIFER ?? ""),
            tpoFix: item.ADA__PRCFI?.trim(),
            valFix: item.ADA__VLFIX,
            valUnit: item.ADA__VLRUN,
            valTot: item.ADA__VLRTO,
            mesEmb: item.ADA__MESEM?.trim(),
            peneira: item.ADA__PEN?.trim(),
            bebida: item.ADA__BEB?.trim(),
            linha: item.ADA__PADRA?.trim(),
            descQual: item.ADA__DESCC?.trim(),
            mesFix: item.ADA__MESFI?.trim(),
            certificado: item.ADA__CRTDO?.trim(),
            residuo: item.ADA__RESEL?.trim(),
            fixador: item.ADA__FIXAC?.trim(),
            pen17: item.ADA__PEN17,
            pen14: item.ADA__PEN14,
            grinder: item.ADA__GRIND,
            tipoVda: item.ADA__TPVDA?.trim(),
            quantCtrt: item.SUM_QTD,
            entregueCtrt: item.SUM_ENT,
            qtdFixado: Number(item.QTDFIX_SUM || 0),
            valFixado: Number(item.VLFIX_SUM || 0),
            tipo: !cQuali.includes(item.ADA__PADRA) ? "Export" : "Consumo",
            exp: 0,
            cons: 0,
            consScs: 0,
            expScs: 0
        });

        if (!(cQuali).includes(item.ADA__PADRA)) {
            vCons = 0;
            vExp = (item.SUM_QTD - item.SUM_ENT);
        } else {
            vCons = (item.SUM_QTD - item.SUM_ENT);
            vExp = 0;
        }
        dto.exp = vExp;
        dto.cons = vCons;
        dto.consScs = vCons / 59;
        dto.expScs = vExp / 59;

        if (tipo === "vda" && ((vQtdCtr - vEntCtr) > 0)) {
            lst.push(dto);
        }
        if (tipo === "afx") {
            dto.exp = item.SUM_QTD - (item.QTDFIX_SUM * 59);
            dto.expScs = (item.SUM_QTD / 59) - item.QTDFIX_SUM;
            lst.push(dto);
        }
        if (tipo === "afe" && item.SUM_ENT > 0) {
            vExp = item.SUM_ENT;
            dto.exp = vExp - (item.QTDFIX_SUM * 59);
            dto.expScs = (vExp / 59) - item.QTDFIX_SUM;
            lst.push(dto);
        }
        if (tipo === "fxd" && ((vQtdCtr - vEntCtr) > 0)) {
            lst.push(dto);
        }
    }
    return lst;
}

export async function getZ11Pcn() {
    let qualidade = "";

    const sql = `SELECT Z11_CODPRI FROM Z11010 WHERE
                    D_E_L_E_T_ <> '*' AND 
                    Z11_TPCAD = 'PCN'`;

    const response = await executeQueryNet(sql);
    
    if (response.recordset && response.recordset.length > 0) {
        qualidade = response.recordset.map((row: any) => row.Z11_CODPRI).join(",");
    }

    return qualidade;
}

export async function getLoteBolsaLongShort() {

    const sql = `SELECT SUM(CASE WHEN Z03_TIPO = 'V' THEN Z03_LOTES ELSE 0 END) AS 'Venda',
                    SUM(CASE WHEN Z03_TIPO = 'C' THEN Z03_LOTES ELSE 0 END) AS 'Compra',
                    SUM(CASE WHEN Z03_TIPO = 'C' THEN Z03_LOTES ELSE Z03_LOTES *-1 END) AS 'Saldo',
                    SUM(CASE WHEN Z03_TIPO = 'C' THEN Z03_LOTES ELSE Z03_LOTES *-1 END)*288.30023516904566 AS 'Sacas'
                    From Z03010 Z03
                    Where (D_E_L_E_T_ != '*')
                    and (Z03.Z03_FILIAL In ('02','05','10','11','15','19','20'))`;

    const response = await executeQueryNet(sql);

    let count = 1;
    const lst = response.recordset.map((item: any) => {
        const dto = new LS_LoteBolsa();
        dto.rec = count ++;
        dto.compra = item.Compra;
        dto.venda = item.Venda;
        dto.saldo = item.Saldo;
        dto.sacas = item.Sacas;
        return dto
    });
    return lst
}

export async function getConsignadoLongShort (): Promise<LS_Consignado[]> {
    let count = 1;
    let vSacasLimpas = 0;
    let vExportavel = 0;
    let vConsumo = 0;

    const sql = `Select SZQ.ZQ_FILIAL AS FILIAL, SZQ.ZQ_CONTRAT AS CONTRATO, SZQ.ZQ_DATA AS DATA, SZQ.ZQ_FORNECE AS FORNECE, SZQ.ZQ_LOJA AS LOJA, SB8.B8_PRODUTO AS PRODUTO, SB8.B8__TPCAFE AS TPCAFE,
    SB8.B8__PEN AS PEN, SB8.B8__BEB AS BEB, SB8.B8__COR AS COR, SB8.B8__LINCAF AS LINHA,
    SB8.B8__QUEBRA AS QUEBRA, SB8.B8__PVA AS PVA, SB8.B8__RENDA AS RENDA, SB8.B8__IMPUKG AS IMPUKG, SZQ.ZQ_LOTECTL AS LOTE,
    SB8.B8__TPVOLS AS TPVOLS, SB8.B8__VOLS AS VOLS, SB8.B8__SAFRA AS SAFRA, SB8.B8__DEFEIT AS DEFEIT, SB8.B8__GRINDE AS GRINDER, SB8.B8__IMPURE AS IMPURE,
    SB8.B8__PEN14 AS PEN14, SB8.B8__PEN17 AS PEN17,
    SZQ.ZQ_QTDORI AS QTDCTR,
    (SELECT A2_NREDUZ FROM SA2010 WHERE SA2010.D_E_L_E_T_<>'*' AND A2_FILIAL = SZQ.ZQ_FILIAL AND A2_COD = SZQ.ZQ_FORNECE AND A2_LOJA = SZQ.ZQ_LOJA ) AS NOMEFOR,
    ISNULL((Select Sum(SZR.ZR_QUANTI)
    From SZR010 SZR
    Where SZR.D_E_L_E_T_ != '*'
    and SZR.ZR_FILIAL = SZQ.ZQ_FILIAL
    and SZR.ZR_CONTRAT = SZQ.ZQ_CONTRAT
    and SZR.ZR_TIPO != 'C'
    and SZR.ZR_LOTECTL = SZQ.ZQ_LOTECTL),0) as SAIDAS ,
    ISNULL((Select Sum(SZRE.ZR_QUANTI)
    From SZR010 SZRE
    Where (SZRE.D_E_L_E_T_ = ' ')
    and (SZRE.ZR_FILIAL  = SZQ.ZQ_FILIAL)
    and (SZRE.ZR_DATA   <= 20191015)
    and (SZRE.ZR_CONTRAT = SZQ.ZQ_CONTRAT)
    and (SZRE.ZR_LOTECTL = SZQ.ZQ_LOTECTL)
    and (SZRE.ZR_TIPO    = 'C')),0) as ENTRADAS
    From SZQ010 SZQ, SB8010 SB8
    Where (SZQ.D_E_L_E_T_ != '*')
    and (SB8.D_E_L_E_T_ != '*')
    and (SZQ.ZQ_FILIAL  In ('02','05','10','11','15','19','20'))
    and (SB8.B8_FILIAL   = SZQ.ZQ_FILIAL)
    and (SB8.B8_PRODUTO IN ('00100','00101'))
    and (SB8.B8_LOCAL   != '50')
    and (SB8.B8_LOTECTL  = SZQ.ZQ_LOTECTL)
    and ZQ_USERLGI <> 'ENCERRADO'
    UNION ALL
    Select SC7.C7_FILIAL AS FILIAL, SC7.C7_NUM AS CONTRATO, SD1.D1_DTDIGIT AS DATA, SD1.D1_FORNECE AS FORNECE, SD1.D1_LOJA AS LOJA,
    SB8.B8_PRODUTO AS PRODUTO, SB8.B8__TPCAFE AS TPCAFE, SB8.B8__PEN AS PEN, SB8.B8__BEB AS BEB, SB8.B8__COR AS COR, SB8.B8__LINCAF AS LINHA, SB8.B8__QUEBRA AS QUEBRA,
    SB8.B8__PVA AS PVA, SB8.B8__RENDA AS RENDA, SB8.B8__IMPUKG AS IMPUKG, SC7.C7_NUMSC AS LOTE, SB8.B8__TPVOLS AS TPVOLS, SB8.B8__VOLS AS VOLS, SB8.B8__SAFRA AS SAFRA,
    SB8.B8__DEFEIT AS DEFEIT, SB8.B8__GRINDE AS GRINDER, SB8.B8__IMPURE AS IMPURE, SB8.B8__PEN14 AS PEN14, SB8.B8__PEN17 AS PEN17, (SD1.D1_QUANT - SD1.D1_QTDEDEV) AS QTDCTR,
    (SELECT A2_NREDUZ FROM SA2010 WHERE SA2010.D_E_L_E_T_<>'*' AND A2_FILIAL = D1_FILIAL AND A2_COD = D1_FORNECE AND A2_LOJA = D1_LOJA ) AS NOMEFOR,
    0 AS SAIDAS,
    (SD1.D1_QUANT - SD1.D1_QTDEDEV) AS ENTRADAS
    FROM SD1010 SD1, SC7010 SC7, SB8010 SB8, SB1010 SB1, SC1010 SC1, ZC1010 ZC1
    WHERE
    SD1.D_E_L_E_T_ <> '*' AND
    SC7.D_E_L_E_T_ <> '*' AND
    SB8.D_E_L_E_T_ <> '*' AND
    SB1.D_E_L_E_T_ <> '*' AND
    SC1.D_E_L_E_T_ <> '*' AND
    ZC1.D_E_L_E_T_ <> '*' AND
    SC7.C7__CONSIG = 'S' AND
    SD1.D1_FILIAL = SC7.C7_FILIAL AND
    SD1.D1_PEDIDO = SC7.C7_NUM AND
    SD1.D1_FORNECE = SC7.C7_FORNECE AND
    SD1.D1_LOJA = SC7.C7_LOJA AND
    SC1.C1_NUM = SC7.C7_NUMSC AND
    SC1.C1__CST60 = 0 AND
    ZC1.ZC1_FILIAL = SC1.C1_MSFIL AND
    ZC1.ZC1_NUMSC = SC1.C1_NUM AND
    SB1.B1_FILIAL = SD1.D1_FILIAL AND
    SB1.B1_COD = SD1.D1_COD AND
    SB8.B8_FILIAL = SD1.D1_FILIAL AND
    SB8.B8_PRODUTO = SD1.D1_COD AND
    SB8.B8_LOTECTL = SD1.D1_LOTECTL
    UNION ALL
    Select SC7.C7_FILIAL AS FILIAL, SC7.C7_NUM AS CONTRATO, SD1.D1_DTDIGIT AS DATA, SD1.D1_FORNECE AS FORNECE, SD1.D1_LOJA AS LOJA,
    SC1.C1_PRODUTO AS PRODUTO, SC1.C1__TPCAFE AS TPCAFE, SC1.C1__PEN AS PEN, SC1.C1__BEB AS BEB, '' AS COR, SC1.C1__LINCAF AS LINHA, SC1.C1__QUEBRA AS QUEBRA, SC1.C1__PVA AS PVA, SC1.C1__RENDA AS RENDA,
    SC1.C1__IMPUKG AS IMPUKG, SC7.C7_NUMSC AS LOTE, '00085' AS TPVOLS, SD1.D1_QTSEGUM AS VOLS, SC1.C1__SAFRA AS SAFRA, SC1.C1__DEFEIT AS DEFEIT, SC1.C1__GRINDE AS GRINDER, SC1.C1__IMPURE AS IMPURE,
    SC1.C1__PEN14 AS PEN14, SC1.C1__PEN17 AS PEN17,
    (SD1.D1_QUANT - SD1.D1_QTDEDEV) AS QTDCTR, '' AS NOMEFOR,
    0 AS SAIDAS,
    (SD1.D1_QUANT - SD1.D1_QTDEDEV) AS ENTRADAS
    FROM SD1010 SD1, SC7010 SC7, SB1010 SB1, SC1010 SC1, ZC1010 ZC1
    WHERE
    ZC1.D_E_L_E_T_ <> '*' AND
    ZC1.ZC1_FILIAL = SC1.C1_MSFIL AND
    ZC1.ZC1_NUMSC = SC1.C1_NUM AND
    SC1.C1__CONSIG = 'S' AND
    SC1.C1__CST60 = 0 AND
    SC1.D_E_L_E_T_ <> '*' AND
    SC7.C7_NUMSC = SC1.C1_NUM AND
    SC7.C7__CONSIG = 'S' AND
    SC7.D_E_L_E_T_ <> '*' AND
    SD1.D1_FILIAL = SC7.C7_FILIAL AND
    SD1.D1_FORNECE = SC7.C7_FORNECE AND
    SD1.D1_LOJA = SC7.C7_LOJA AND
    SD1.D1__NUMPC = SC7.C7_NUM AND
    SD1.D1_LOTECTL = '' AND
    SD1.D1_TIPO = 'N' AND
    SD1.D_E_L_E_T_ <> '*' AND
    SB1.B1_FILIAL = SD1.D1_FILIAL AND
    SB1.B1_COD = SD1.D1_COD AND
    SB1.D_E_L_E_T_ <> '*'
    Order By SZQ.ZQ_FILIAL, SB8.B8_PRODUTO, SB8.B8__TPCAFE`;

    const response = await executeQueryNet(sql);

    const lst: LS_Consignado[] = [];
    for (const item of response.recordset) {
        const dto = {
            rec: count++,
            filial: item.FILIAL?.trim(),
            contrato: item.CONTRATO?.trim() || "",
            data: formatDate(item.DATA?.trim() || "", "dma"),
            fornece: item.FORNECE?.trim() || "",
            nomefor: item.NOMEFOR?.trim() || "",
            loja: item.LOJA?.trim() || "",
            produto: item.PRODUTO?.trim() || "",
            tpcafe: item.TPCAFE?.trim() || "",
            pen: "...",
            beb: item.BEB?.trim() || "",
            cor: item.COR?.trim() || "",
            linha: item.LINHA?.trim() || "",
            quebra: item.QUEBRA || 0,
            pva: item.PVA || 0,
            renda: item.RENDA || 0,
            impukg: item.IMPUKG || 0,
            lote: item.LOTE?.trim() || "",
            tpvols: item.TPVOLS?.trim() || "",
            vols: item.VOLS || 0,
            safra: item.SAFRA?.trim() || "",
            defeit: item.DEFEIT?.trim() || "",
            grinder: item.GRINDER || 0,
            impure: item.IMPURE || 0,
            pen14: item.PEN14 || 0,
            pen17: item.PEN17 || 0,
            qtdctr: item.QTDCTR || 0,
            saidas: item.SAIDAS || 0,
            entradas: item.ENTRADAS || 0,

        // Calcula vExportavel e vConsumo
        vExportavel: vSacasLimpas * (item.pen17 + item.pen14 + item.grinder - item.quebra) / 100 / 59,
        vConsumo: vSacasLimpas * (item.pva + item.quebra + item.impure) / 100 / 59,

        cons: vConsumo,
        exp: vExportavel
        };
        lst.push(dto);
    }

    return lst;
}