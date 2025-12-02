import { executeQueryNet, normalizeGeoJSON, detectIntersections, detectConflitosExternos } from "../../utils/dbExecute";
const bbox = require('@turf/bbox').default;
const area = require('@turf/area').default;

/**
 * Função principal que retorna informações completas sobre CARs (Cadastro Ambiental Rural) de um contrato
 * Inclui análise de interseções geográficas, cálculo de áreas e detecção de conflitos
 * @param filial - Código da filial
 * @param nContrato - Número do contrato (pode ser sobrescrito se cVenda for fornecido)
 * @param cVenda - Código de venda externo opcional (ex: "394/25A")
 */
export async function getCodCor (filial: string, nContrato: string, cVenda?: string) {
    try {
        // =====================================================================
        // ETAPA 1: BUSCAR CONTRATO PELO CÓDIGO DE VENDA (SE FORNECIDO)
        // =====================================================================
        if (cVenda && cVenda.trim().length > 0) {
            // Extrai letra do final se existir (ex: "394/25A" -> letra = "A", cVendaBase = "394/25")
            const letraMatch = cVenda.match(/([A-Za-z])$/);
            const letra = letraMatch?.[1]?.toUpperCase() || '';
            const cVendaBase = letra ? cVenda.slice(0, -1) : cVenda;

            let sqlVenda = `SELECT ADA_NUMCTR 
                            FROM ADA900 
                            WHERE ADA_FILIAL = @filial 
                            AND ADA__CTREX = @cVendaBase`;
            
            if (letra) {
                sqlVenda += ` AND ADA__LETRA = @letra`;
            }
            
            const responseVenda = await executeQueryNet(sqlVenda, { filial, cVendaBase, letra });
            
            // Sobrescreve nContrato se encontrar pelo código de venda
            if (responseVenda.recordset && responseVenda.recordset.length > 0) {
                nContrato = responseVenda.recordset[0].ADA_NUMCTR;
            }
        }

        // =====================================================================
        // ETAPA 2: DEFINIR QUERIES SQL
        // =====================================================================
        
        // Query para buscar lote do contrato
        const sqlContr = `SELECT DISTINCT SD3.D3_LOTECTL, SD3.D3_LOCAL, SUM(SD3.D3_QUANT) AS KG_CTR 
                          FROM SD3900 SD3 
                          WHERE SD3.D_E_L_E_T_ <> '*' 
                          AND SD3.D3_FILIAL = @filial 
                          AND SD3.D3_ESTORNO = '' 
                          AND SD3.D3_TM = '900' 
                          AND SD3.D3_COD = '00100' 
                          AND SD3.D3__NUMCTR = @nContrato
                          GROUP BY SD3.D3_LOTECTL, SD3.D3_LOCAL`;

        // Query para buscar CARs associados ao lote
        const sqlCars = `SELECT Z0F.Z0F_IDENTI AS identi, Z0F.Z0F_CAR AS car, 
                         Z0C.Z0C_STATUS AS status, Z0C.Z0C_LINK AS link 
                         FROM Z0F900 Z0F, Z0C010 Z0C 
                         WHERE Z0F.D_E_L_E_T_ <> '*' 
                         AND Z0C.D_E_L_E_T_ <> '*' 
                         AND Z0F.Z0F_FILIAL = @filial 
                         AND Z0F.Z0F_LOTE = @lote 
                         AND Z0F.Z0F_LOCAL = '01' 
                         AND Z0C.Z0C_IDENTI = Z0F.Z0F_IDENTI 
                         AND Z0C.Z0C_CAR = Z0F.Z0F_CAR`;

        // Query para buscar dados geográficos de cada CAR (GeoJSON, coordenadas, cidade)
        const sqlGeo = `SELECT Z0C_GEOJSO, Z0C_GEOCOR, Z0C_GEOCAF, Z0C_CIDADE
                        FROM Z0C010
                        WHERE D_E_L_E_T_ <> '*'
                        AND Z0C_IDENTI = @identi
                        AND Z0C_CAR = @car`;

        // Query para buscar informações do cliente/certificado
        const sqlCertif = `SELECT A.ADA_FILIAL, A.ADA_CODCLI, A.ADA_LOJCLI, A.ADA__CRTDO, S.A1_NOME
                           FROM ADA900 A
                           INNER JOIN SA1900 S
                           ON A.ADA_FILIAL = S.A1_FILIAL
                           AND A.ADA_CODCLI = S.A1_COD
                           AND A.ADA_LOJCLI = S.A1_LOJA
                           WHERE A.ADA_NUMCTR = @nContrato`;

        // Query para buscar status adicional de cada CAR
        const sqlStatus = `SELECT Z0D_STATUS, Z0D_DETALH FROM Z0D010 WHERE Z0D_CAR = @car`;
        
        // =====================================================================
        // ETAPA 3: EXECUTAR QUERIES PRINCIPAIS
        // =====================================================================
        
        // Busca lote do contrato
        const response1 = await executeQueryNet(sqlContr, {filial, nContrato});
        const lote = (response1.recordset[0]?.D3_LOTECTL || '').trim();
        
        // Busca CARs do lote
        const response2 = await executeQueryNet(sqlCars, {filial, lote});

        // Busca dados do certificado/cliente

        // Busca dados do certificado/cliente
        const response3 = await executeQueryNet(sqlCertif, {nContrato})

        // =====================================================================
        // ETAPA 4: BUSCAR DADOS GEOGRÁFICOS (GEOJSON) DE CADA CAR
        // =====================================================================
        
        // Executa queries em paralelo para buscar GeoJSON de todos os CARs
        const geoPromises = response2.recordset.map((record: any) => 
            executeQueryNet(sqlGeo, {
                identi: record.identi,
                car: record.car
            })
        );
        const geoResults = await Promise.all(geoPromises);
        
        // =====================================================================
        // ETAPA 5: COMBINAR RESULTADOS E GERAR NOME DE PRODUTO
        // =====================================================================
        
        const resultados = response2.recordset.map((record: any, index: number) => {
            const identi = (record.identi || '').trim();
            const car = (record.car || '').trim();
            
            // Gera nome do produto conforme lógica do Protheus:
            // Subs(Z0C->Z0C_IDENTI,4,6) + Subs(Alltrim(Z0C->Z0C_CAR), Len(Alltrim(Z0C->Z0C_CAR))-15)
            const identiPart = identi.substring(3, 9); // 6 caracteres a partir da posição 4
            const carPart = car.substring(car.length - 16); // últimos 16 caracteres
            const prodName = identiPart + carPart;
            
            return {
                identi: identi,
                car: car,
                status: (record.status || '').trim(),
                link: (record.link || '').trim(),
                cidade: (geoResults[index].recordset[0]?.Z0C_CIDADE || '').trim(),
                prodName: prodName,
                Z0C_GEOJSO: geoResults[index].recordset[0]?.Z0C_GEOJSO,
                Z0C_GEOCOR: geoResults[index].recordset[0]?.Z0C_GEOCOR,
                Z0C_GEOCAF: geoResults[index].recordset[0]?.Z0C_GEOCAF
            };
        });

        // =====================================================================
        // ETAPA 6: BUSCAR STATUS ADICIONAL DE CADA CAR
        // =====================================================================
        
        const statusPromises = response2.recordset.map((record: any) => 
            executeQueryNet(sqlStatus, { car: record.car })
        );
        const statusResults = await Promise.all(statusPromises);
        
        // Cria array com os status de todos os CARs (pode haver múltiplos status por CAR)
        const statusArray = response2.recordset.flatMap((record: any, index: number) => {
            return statusResults[index].recordset.map((status: any) => ({
                car: (record.car || '').trim(),
                Z0D_STATUS: (status.Z0D_STATUS || '').trim(),
                Z0D_DETALH: (status.Z0D_DETALH || '').trim()
            }));
        });

        // =====================================================================
        // ETAPA 7: ANÁLISE GEOGRÁFICA - NORMALIZAÇÃO E CÁLCULO DE ÁREAS
        // =====================================================================
        
        const featuresParaAnalise: any[] = [];
        let areaTotal = 0;

        for (const resultado of resultados) {
            // Prioriza Z0C_GEOCOR (coordenadas corrigidas), senão usa Z0C_GEOJSO
            const geojsonParaAnalise = resultado.Z0C_GEOCOR || resultado.Z0C_GEOJSO;
            const feat = normalizeGeoJSON(geojsonParaAnalise, resultado.car);
            if (!feat) continue;

            try {
                // Calcula bounding box e área usando bibliotecas Turf.js
                const [minX, minY, maxX, maxY] = bbox(feat);
                const areaM2 = area(feat);
                
                featuresParaAnalise.push({
                    id: resultado.car,
                    identi: resultado.identi,
                    feature: feat,
                    bbox: { minX, minY, maxX, maxY },
                    area_m2: areaM2
                });
                
                areaTotal += areaM2;
            } catch (e) {
                // Ignora registros com erro de bbox ou área
            }
        }

        // =====================================================================
        // ETAPA 8: DETECÇÃO DE INTERSEÇÕES E CONFLITOS
        // =====================================================================
        
        // Detecta interseções internas (entre CARs do mesmo contrato)
        const intersecoesInternas = detectIntersections(featuresParaAnalise);

        // Detecta conflitos externos (CARs deste contrato que se sobrepõem a CARs de outros contratos)
        const intersecoesExternas = await detectConflitosExternos(featuresParaAnalise, executeQueryNet);

        // =====================================================================
        // ETAPA 9: PROCESSAR DADOS DO CERTIFICADO
        // =====================================================================
        
        const dadosCertificado = response3.recordset[0] || {};
        const clienteNome = (dadosCertificado.A1_NOME || '').trim();
        const clienteCod = (dadosCertificado.ADA_CODCLI || '').trim();
        const certificado = (dadosCertificado.ADA__CRTDO || '').trim();

        // =====================================================================
        // ETAPA 10: ADICIONAR ÁREA E INFORMAÇÕES DE CONFLITO A CADA COORDENADA
        // =====================================================================
        
        const coordenadasComArea = resultados.map((coord: any) => {
            const feature = featuresParaAnalise.find(f => f.id === coord.car);
            
            // Verifica se este CAR tem conflitos externos
            const conflitosDesteCar = intersecoesExternas.filter(c => c.car_contrato === coord.car);
            const temConflito = conflitosDesteCar.length > 0;
            
            return {
                area_m2: feature?.area_m2 ? parseFloat(feature.area_m2.toFixed(2)) : 0,
                tem_conflito: temConflito,
                conflitos: temConflito ? conflitosDesteCar.map(c => ({
                    car_externo: (c.car_externo || '').trim(),
                    identi_externo: (c.identi_externo || '').trim(),
                    area_intersecao_m2: c.area_intersecao_m2
                })) : [],
                ...coord
            };
        });

        // =====================================================================
        // ETAPA 11: MONTAR E RETORNAR RESPOSTA FINAL
        // =====================================================================
        
        return {
            lote: lote,
            cliente: clienteNome,
            clienteCod: clienteCod,
            certificado: certificado,
            area_total_m2: parseFloat(areaTotal.toFixed(2)),
            status_cars: statusArray,
            coordenadas: coordenadasComArea,
            analise_intersecoes: {
                total_cars_analisados: resultados.length,
                intersecoes_internas: {
                    detalhes: intersecoesInternas
                },
                intersecoes_externas: {
                    detalhes: intersecoesExternas
                }
            }
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
}