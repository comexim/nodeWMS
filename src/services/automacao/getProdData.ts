import { executeQueryLocal, executeQueryNet } from "../../utils/dbExecute";
import { formatDate } from "../../utils/dateFormat";

export async function getProdData (dataIni: string, dataFim: string, pilha: string) {
    const sqlSintetico = `SELECT Z.Z71_DATA AS DATA, Z.Z71_LOTECT AS LOTE,
                                 SUM(Z.Z71_PESO) AS PESO_TOTAL, ROUND(SUM(Z.Z71_PESO) / 59,2) AS SACAS
                             FROM Z71010 Z
                             WHERE Z.Z71_DATA BETWEEN @dataIni AND @dataFim
                             GROUP BY 
                                 Z.Z71_DATA,
                                 Z.Z71_LOTECT
                             ORDER BY Z.Z71_DATA, Z.Z71_LOTECT`

    const sqlAnalitico = `SELECT Z.Z71_DATA AS DATA, Z.Z71_HORA AS HORA, 
                                 Z.Z71_LOTECT AS LOTE, Z.Z71_SETOR AS SETOR,
                                 Z.Z71_PESO AS PESO, ROUND(Z.Z71_PESO / 59,2) AS SACAS,
                                 Z.Z71_TAGRF AS TAG, W.EnderCod AS POSICAO
                             FROM Z71010 Z
                             LEFT JOIN WMS_Endereco W
                                 ON W.BagTag = Z.Z71_TAGRF
                             WHERE Z.Z71_DATA BETWEEN @dataIni AND @dataFim
                             ORDER BY Z.Z71_DATA, Z.Z71_LOTECT, Z.Z71_HORA`

    try {
        const params = { dataIni, dataFim };

        const resultSintetico = await executeQueryLocal(sqlSintetico, params);
        const resultAnalitico = await executeQueryLocal(sqlAnalitico, params);

        // Filtra por pilha se necessário
        let dadosFiltrados = resultSintetico.recordset;
        if (pilha?.toLowerCase() === 'sim') {
            dadosFiltrados = dadosFiltrados.filter((item: any) => 
                item.LOTE?.startsWith('P') && item.LOTE?.endsWith('SS')
            );
        }

        // Agrupa os dados por lote
        const dadosAgrupados = dadosFiltrados.map((cabecalho: any) => ({
            cabecalho: {
                ...cabecalho,
                DATA: formatDate(cabecalho.DATA, "dma")
            },
            detalhes: resultAnalitico.recordset
                .filter((detalhe: any) => detalhe.LOTE === cabecalho.LOTE)
                .map((detalhe: any) => ({
                    ...detalhe,
                    DATA: formatDate(detalhe.DATA, "dma"),
                    TAG: detalhe.TAG?.slice(-6)
                }))
        }));

        return dadosAgrupados;
    } catch (error) {
        console.error('Erro ao buscar dados de produção:', error);
        throw error;
    }
}