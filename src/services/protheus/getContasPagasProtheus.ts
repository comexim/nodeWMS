import ContasPagar_DTO from "../../models/protheus/ContasPagar_DTO";
import MsgRetorno from "../../models/protheus/MsgRetorno";
import { formatDate } from "../../utils/dateFormat";
import { executeQueryNet } from "../../utils/dbExecute";

export async function getContasPagas(DataIni: string, DataFim: string): Promise<{lst: MsgRetorno} | MsgRetorno> {
    try{
        const dataIni = formatDate(DataIni, "amd");
        const dataFim = formatDate(DataFim, "amd");
        console.log("DataIni:", dataIni);
        console.log("DataFim:", dataFim);
        const sql = `SELECT
                        A6_FILIAL as filial,
                        E5_NUMERO as numero,
                        ISNULL(RATEIO.CC,'') AS centroCusto,
                        ISNULL(RATEIO.NAT,'') AS natureza,
                        ISNULL(RATEIO.APROVADOR, 'NÃO HÁ') AS aprovador,
                        ISNULL(RATEIO.APROVADOR2, 'NÃO HÁ') AS aprovador2,
                        A6_NOMEAGE AS banco,
                        E2_EMISSAO AS emissao,
                        E2_VENCREA AS vencimento,
                        ISNULL(E5_DATA,'') AS pagamento,
                        CASE WHEN E5_MOEDA = '1' THEN 'R$' ELSE CASE WHEN E5_MOEDA = '2' THEN 'US$' ELSE CASE WHEN E5_MOEDA = '4' THEN 'EUR$' ELSE CASE WHEN E5_MOEDA = '5' THEN 'CHF$' ELSE CASE WHEN E5_MOEDA = '01' THEN 'R$' ELSE CASE WHEN E5_MOEDA = 'M1' THEN 'R$' ELSE CASE WHEN E5_MOEDA = 'M2' THEN 'US$' ELSE CASE WHEN E5_MOEDA = '02' THEN 'US$' ELSE E5_MOEDA END END END END END END END END AS moeda,
                        CONCAT(CASE WHEN E5_MOEDA = '1' THEN 'R$' ELSE CASE WHEN E5_MOEDA = '2' THEN 'US$' ELSE CASE WHEN E5_MOEDA = '4' THEN 'EUR$' ELSE CASE WHEN E5_MOEDA = '04' THEN 'EUR$' ELSE CASE WHEN E5_MOEDA = '5' THEN 'CHF$' ELSE CASE WHEN E5_MOEDA = '01' THEN 'R$' ELSE CASE WHEN E5_MOEDA = 'M1' THEN 'R$' ELSE CASE WHEN E5_MOEDA = 'M2' THEN 'US$' ELSE CASE WHEN E5_MOEDA = '02' THEN 'US$' ELSE E5_MOEDA END END END END END END END END END,'  ', ISNULL(CASE WHEN E5_RECPAG = 'P' THEN cast(E5_VALOR*-1 AS NUMERIC(15,2)) ELSE cast(E5_VALOR AS NUMERIC(15,2)) END,0)) AS moedaStr,
                        CAST(ISNULL(CASE WHEN E5_RECPAG = 'P' THEN E5_VALOR*-1 ELSE E5_VALOR END,0) AS VARCHAR) AS valor,
                        CAST(E5_VLJUROS + E5_VLMULTA AS VARCHAR) AS juros, CAST(E5_VLDESCO + E5_VLDECRE AS VARCHAR) as decrescimo, CAST(E5_VLACRES AS VARCHAR) as acrescimo,
                        ISNULL(A2_NREDUZ,'-') AS fornecedor
                        FROM SE5010 SE5
                        OUTER APPLY (
                            SELECT TOP 1 CTT_DESC01 AS CC, Z78_DESCRI AS NAT, Z79_ID,
                            CASE WHEN Z79_APROV1 = '' THEN 'APROV AUT' ELSE (SELECT TOP 1 AK_NOME FROM SAK010 WHERE AK_FILIAL = Z79_FILIAL AND AK_USER = Z79_APROV1) END  AS APROVADOR,
                            CASE WHEN Z79_APROV2 = '' THEN 'APROV2 AUT' ELSE (SELECT TOP 1 AK_NOME FROM SAK010 WHERE AK_FILIAL = Z79_FILIAL AND AK_USER = Z79_APROV2 AND Z79_DTLIB2<> '') END  AS APROVADOR2
                            FROM Z79010 Z79, Z78010 Z78, CTT010 CTT
                            WHERE Z79.D_E_L_E_T_<>'*'
                            AND Z78.D_E_L_E_T_<>'*'
                            AND CTT.D_E_L_E_T_<>'*'
                            AND CTT_CUSTO = Z79_CC
                            AND Z78_COD = Z79_NAT
                            AND Z79_FILIAL = SE5.E5_FILIAL
                            AND Z79_ID = SE5.E5__IDRAT
                        ) AS RATEIO, SA6010 SA6
                        , SE2010 SE2, SA2010 SA2
                        WHERE
                        SE5.D_E_L_E_T_<> '*'
                        AND SE2.D_E_L_E_T_<> '*'
                        AND SA2.D_E_L_E_T_<> '*'
                        AND E5_FILIAL = A6_FILIAL
                        AND E5_BANCO = A6_COD
                        AND E5_AGENCIA = A6_AGENCIA
                        AND E5_CONTA = A6_NUMCON
                        AND E5_FILIAL = E2_FILIAL
                        AND E5_PREFIXO = E2_PREFIXO
                        AND E5_NUMERO = E2_NUM
                        AND E5_PARCELA = E2_PARCELA
                        AND E5_FORNECE = E2_FORNECE
                        AND E5_LOJA = E2_LOJA
                        AND A2_FILIAL = E2_FILIAL
                        AND A2_COD = E2_FORNECE
                        AND A2_LOJA = E2_LOJA
                        AND E5_TIPODOC NOT IN  ('BA','CP','DC','MT','CH','JR','AP','PE','ES')
                        AND E5_SITUACA NOT IN ('C', 'E', 'X')
                        AND E5_DTCANBX  = ''
                        AND E5_KEY = ''
                        AND E5_MOTBX  NOT IN ('CMP', 'CNC','DAC')
                        AND (E5_MOTBX <> 'DEB' or (E5_MOTBX = 'DEB' and E5_BANCO   <> ''))
                        AND E5_DATA >= @DataIni
                        AND E5_DATA <= @DataFim
                        AND SA6.D_E_L_E_T_<>'*'
                        AND A6_FLUXCAI = 'S'
                        ORDER BY E5_DATA, E5_VALOR`;

        const response = await executeQueryNet(sql, {dataIni, dataFim});
        const lst = response.recordset.map((item: any) => {
            const dto = new ContasPagar_DTO(item);

            if (dto.emissao) dto.emissao = formatDate(dto.emissao, "dma");
            if (dto.vencimento) dto.vencimento = formatDate(dto.vencimento, "dma");
            if (dto.pagamento) dto.pagamento = formatDate(dto.pagamento, "dma");
            Object.keys(dto).forEach(key => {
                if (typeof (dto as any)[key] === "string") {
                    (dto as any)[key] = (dto as any)[key].trim();
                }
            });
            return dto;
        });

        if (lst.length > 0) {
            return lst;
        } else {
            return new MsgRetorno ({
                codRet: "500",
                descrRet: "Nenhum dado"
            })
        }
    } catch (error) {
        return new MsgRetorno ({
            codRet: "501",
            descrRet: "Erro interno"
        })
    }
}