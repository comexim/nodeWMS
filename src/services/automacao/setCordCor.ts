import { executeQueryNet, normalizeGeoJSON, safeDifferenceWithGap } from "../../utils/dbExecute";

const area = require('@turf/area').default;

export async function setCordCor (cord1: string, cord2: string, identi1: string, identi2: string) {
    try {
        console.log('=== INICIANDO BUSCA NO BANCO ===');
        console.log('Parâmetros:', { cord1, cord2, identi1, identi2 });
        
        // Buscar coordenadas do banco (busca individual para cada CAR com seu identi)
        // Prioriza Z0C_GEOCOR se existir, senão usa Z0C_GEOJSO
        const sqlGeo1 = `SELECT Z0C_CAR AS car, Z0C_IDENTI AS identi, 
                         CASE 
                             WHEN Z0C_GEOCOR IS NOT NULL AND Z0C_GEOCOR <> '' 
                             THEN Z0C_GEOCOR 
                             ELSE Z0C_GEOJSO 
                         END AS geojson
                         FROM Z0C010
                         WHERE D_E_L_E_T_ <> '*'
                         AND Z0C_CAR = @cord1
                         AND Z0C_IDENTI = @identi1`;

        const sqlGeo2 = `SELECT Z0C_CAR AS car, Z0C_IDENTI AS identi, 
                         CASE 
                             WHEN Z0C_GEOCOR IS NOT NULL AND Z0C_GEOCOR <> '' 
                             THEN Z0C_GEOCOR 
                             ELSE Z0C_GEOJSO 
                         END AS geojson
                         FROM Z0C010
                         WHERE D_E_L_E_T_ <> '*'
                         AND Z0C_CAR = @cord2
                         AND Z0C_IDENTI = @identi2`;

        // Executar queries sequencialmente para evitar problemas de conexão
        console.log('Buscando cord1...');
        const response1 = await executeQueryNet(sqlGeo1, { cord1, identi1 });
        console.log('cord1 encontrada:', response1.recordset.length > 0);
        
        console.log('Buscando cord2...');
        const response2 = await executeQueryNet(sqlGeo2, { cord2, identi2 });
        console.log('cord2 encontrada:', response2.recordset.length > 0);

        const coord1Data = response1.recordset[0];
        const coord2Data = response2.recordset[0];

        if (!coord1Data || !coord2Data) {
            const erro1 = !coord1Data ? `cord1 (${cord1}, identi: ${identi1}) não encontrada` : '';
            const erro2 = !coord2Data ? `cord2 (${cord2}, identi: ${identi2}) não encontrada` : '';
            throw new Error(`Coordenadas não encontradas: ${[erro1, erro2].filter(Boolean).join(', ')}`);
        }

        // Normalizar geometrias
        const feat1 = normalizeGeoJSON(coord1Data.geojson, cord1); // Será mantida
        const feat2 = normalizeGeoJSON(coord2Data.geojson, cord2); // Será alterada

        if (!feat1 || !feat2) {
            throw new Error('Erro ao processar as geometrias');
        }

        // Calcular áreas originais
        const area1 = area(feat1);
        const area2Original = area(feat2);

        // Aplicar diferença com espaçamento mínimo: remover interseção da coord2
        // garantindo que fiquem separadas por pelo menos 0.5 metros
        const feat2Corrigida = safeDifferenceWithGap(feat2, feat1, 0.5);

        if (!feat2Corrigida) {
            throw new Error('Não foi possível calcular a correção da geometria');
        }

        // Calcular estatísticas da correção
        const area2Nova = area(feat2Corrigida);
        const reducao = area2Original - area2Nova;
        const percentualRemovido = ((reducao / area2Original) * 100).toFixed(2);

        // Formatar geometria corrigida para salvar no banco
        const geojsonCorrigido = JSON.stringify({
            type: feat2Corrigida.geometry.type,
            coordinates: feat2Corrigida.geometry.coordinates
        });

        console.log('=== UPDATE NO BANCO (COMENTADO) ===');
        console.log('CAR a ser atualizado:', cord2);
        console.log('IDENTI:', identi2);
        console.log('Tamanho do GeoJSON corrigido:', geojsonCorrigido.length, 'caracteres');

        // Atualizar no banco
        const sqlUpdate = `UPDATE Z0C010 
                           SET Z0C_GEOCOR = @geocor 
                           WHERE Z0C_CAR = @car
                           AND Z0C_IDENTI = @identi`;
        
        try {
            const updateResult = await executeQueryNet(sqlUpdate, {
                geocor: geojsonCorrigido,
                car: cord2,
                identi: identi2
            });
            
            console.log('UPDATE executado com sucesso!');
            console.log('Linhas afetadas:', updateResult.rowsAffected);
        } catch (updateError) {
            console.error('ERRO ao executar UPDATE:', updateError);
            throw new Error(`Falha ao atualizar coordenada no banco: ${updateError}`);
        }

        console.log('=== UPDATE PULADO (MODO DE TESTE) ===');

        return {
            success: true,
            car_mantido: cord1,
            car_modificado: cord2,
            novas_coordenadas: geojsonCorrigido,
            resumo: {
                area_original_m2: parseFloat(area2Original.toFixed(2)),
                area_reduzida_m2: parseFloat(reducao.toFixed(2)),
                area_final_m2: parseFloat(area2Nova.toFixed(2)),
                percentual_removido: `${percentualRemovido}%`
            }
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
}