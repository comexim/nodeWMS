// =====================================================================
// check_intersection_safe.js
// Sistema de detecção e correção de interseções geométricas
// Utiliza JSTS para operações robustas e Turf para validações
// =====================================================================

// ---- Bibliotecas Turf (operações geoespaciais) ----
const area = require('@turf/area').default;
const buffer = require('@turf/buffer').default;
const bbox = require('@turf/bbox').default;
const booleanIntersects = require('@turf/boolean-intersects').default;
const booleanTouches = require('@turf/boolean-touches').default;
const { polygon, multiPolygon, feature } = require('@turf/helpers');

// ---- Índice espacial RBush para otimizar buscas de interseção ----
const RBush = require('rbush').default;
const fs = require('fs').promises;
const path = require('path');

// ---- JSTS: Biblioteca para operações geométricas robustas ----
const jsts = require('jsts');

// ---- Configuração do banco de dados ----
require('dotenv').config();
const sql = require('mssql');

const configNet = {
  server: process.env.SERVERNET,
  port: Number(process.env.PORTNET),
  database: process.env.DATABASENET,
  user: process.env.USERNET,
  password: process.env.PASSWORDNET,
  options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
};

// ---------- Helpers DB ----------
let poolNet = null;
async function getConnectionNet() {
  if (!poolNet) {
    poolNet = new sql.ConnectionPool(configNet);
    await poolNet.connect();
  }
  return poolNet;
}
async function executeQueryNet(sqlStr, params) {
  const pool = await getConnectionNet();
  const request = pool.request();
  if (params) Object.entries(params).forEach(([k, v]) => request.input(k, v ?? null));
  return request.query(sqlStr);
}

// =====================================================================
// CONFIGURAÇÕES GERAIS
// =====================================================================
const GEOJSON_COLUMN = 'Z0C_GEOJSO'; // Coluna que contém os dados GeoJSON
const TABLE = 'Z0C010';               // Tabela principal
const ID_COLUMN = 'Z0C_CAR';          // Coluna de identificação única
const BATCH_SIZE = 300;               // Tamanho do lote para processamento

// =====================================================================
// FUNÇÕES DE NORMALIZAÇÃO E VALIDAÇÃO
// =====================================================================

/**
 * Normaliza diferentes formatos de entrada GeoJSON
 * @param {string|Object} raw - Dados brutos (string JSON, Feature, FeatureCollection ou Geometry)
 * @param {string} id - ID do registro para referência
 * @returns {Object|null} Feature normalizada (Polygon/MultiPolygon) ou null se inválida
 */
function normalizeGeoJSON(raw, id) {
  if (!raw) return null;
  let parsed;
  try {
    // Remove caracteres nulos e faz parse se for string
    parsed = (typeof raw === 'string') ? JSON.parse(raw.replace(/\u0000/g, '').trim()) : raw;
  } catch (e) {
    return null;
  }

  // Se for FeatureCollection, extrai a primeira feature
  if (parsed.type === 'FeatureCollection') {
    if (!parsed.features || !parsed.features.length) return null;
    parsed = parsed.features[0];
  }

  // Converte Geometry para Feature
  if (parsed.type !== 'Feature') {
    parsed = { type: 'Feature', geometry: parsed, properties: {} };
  }

  // Valida geometria e aceita apenas Polygon ou MultiPolygon
  if (!parsed.geometry || !parsed.geometry.type) return null;
  if (!['Polygon', 'MultiPolygon'].includes(parsed.geometry.type)) {
    return null;
  }

  return parsed;
}

/**
 * Fragmenta um MultiPolygon em múltiplos Polygons simples
 * @param {Object} feat - Feature contendo geometria
 * @returns {Array} Array de Features Polygon
 */
function polygonsFromFeature(feat) {
  const geom = feat.geometry;
  if (geom.type === 'Polygon') return [polygon(geom.coordinates, feat.properties)];
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map(coords => polygon(coords, feat.properties));
  }
  return [];
}

/**
 * Limpa geometrias inválidas aplicando buffer zero
 * @param {Object} feat - Feature a ser limpa
 * @returns {Object} Feature limpa ou original se falhar
 */
function cleanGeometry(feat) {
  try {
    return buffer(feat, 0, { units: 'meters' });
  } catch (err) {
    return feat;
  }
}

// =====================================================================
// CONVERSORES JSTS <-> GEOJSON
// =====================================================================
const geoReader = new jsts.io.GeoJSONReader();
const geoWriter = new jsts.io.GeoJSONWriter();

/**
 * Converte Feature ou Geometry GeoJSON para geometria JSTS
 * @param {Object} geojson - Feature ou Geometry GeoJSON
 * @returns {Object|null} Geometria JSTS ou null se inválida
 */
function toJSTS(geojson) {
  if (!geojson) return null;
  try {
    // GeoJSONReader aceita Feature ou Geometry
    const jgeom = geoReader.read(geojson);
    return jgeom;
  } catch (err) {
    return null;
  }
}

/**
 * Converte geometria JSTS para Feature GeoJSON
 * @param {Object} jgeom - Geometria JSTS
 * @returns {Object|null} Feature GeoJSON ou null se inválida
 */
function fromJSTS(jgeom) {
  if (!jgeom) return null;
  try {
    const geo = geoWriter.write(jgeom); // retorna GeoJSON geometry
    return { type: 'Feature', geometry: geo, properties: {} };
  } catch (err) {
    return null;
  }
}

// =====================================================================
// OPERAÇÕES GEOMÉTRICAS ROBUSTAS (JSTS)
// =====================================================================

/**
 * Calcula interseção entre duas features de forma robusta
 * @param {Object} featA - Primeira feature
 * @param {Object} featB - Segunda feature
 * @returns {Object|null} Feature com geometria da interseção ou null
 */
function safeIntersectionJSTS(featA, featB) {
  try {
    const jA = toJSTS(featA);
    const jB = toJSTS(featB);
    if (!jA || !jB) return null;
    const inter = jA.intersection ? jA.intersection(jB) : (jA.geometry ? jA.geometry.intersection(jB.geometry) : null);
    if (!inter || inter.isEmpty()) return null;
    return fromJSTS(inter);
  } catch (err) {
    return null;
  }
}

/**
 * Calcula diferença entre duas features (B - A) de forma robusta
 * @param {Object} featB - Feature base (será subtraída)
 * @param {Object} featA - Feature a remover
 * @returns {Object|null} Feature com geometria resultante ou null
 */
function safeDifferenceJSTS(featB, featA) {
  try {
    const jA = toJSTS(featA);
    const jB = toJSTS(featB);
    if (!jA || !jB) return null;
    const diff = jB.difference ? jB.difference(jA) : (jB.geometry ? jB.geometry.difference(jA.geometry) : null);
    if (!diff || diff.isEmpty()) return null;
    return fromJSTS(diff);
  } catch (err) {
    return null;
  }
}

/**
 * Calcula diferença com múltiplas estratégias de fallback
 * Estratégia 1: JSTS direto
 * Estratégia 2: Limpeza com buffer(0) + JSTS
 * Estratégia 3: Fragmentação + subtração sequencial
 * @param {Object} featB - Feature base (maior, será cortada)
 * @param {Object} featA - Feature a remover (menor, será mantida)
 * @returns {Object|null} Feature resultante ou null se falhar
 */
function safeDifference(featB, featA) {
  // Estratégia 1: Tentativa direta com JSTS
  let result = safeDifferenceJSTS(featB, featA);
  if (result) return result;

  // Estratégia 2: Limpeza de geometrias e nova tentativa
  const cleanA = cleanGeometry(featA);
  const cleanB = cleanGeometry(featB);

  result = safeDifferenceJSTS(cleanB, cleanA);
  if (result) return result;

  // Estratégia 3: Fragmentação em polígonos simples
  const partsB = polygonsFromFeature(cleanB);
  const partsA = polygonsFromFeature(cleanA);

  const resultParts = [];

  // Subtrai cada parte de A de cada parte de B sequencialmente
  for (let i = 0; i < partsB.length; i++) {
    let current = partsB[i];
    for (let j = 0; j < partsA.length; j++) {
      try {
        const d = safeDifferenceJSTS(current, partsA[j]);
        current = d || current;
      } catch (err) {
        // Ignora erros e continua com a geometria atual
      }
    }
    // Extrai coordenadas da geometria resultante
    if (current) {
      if (current.geometry && current.geometry.type === 'Polygon') {
        resultParts.push(current.geometry.coordinates);
      } else if (current.geometry && current.geometry.type === 'MultiPolygon') {
        resultParts.push(...current.geometry.coordinates);
      }
    }
  }

  if (!resultParts.length) return null;

  // Reconstrói Feature com as partes resultantes
  if (resultParts.length === 1) return polygon(resultParts[0]);
  return multiPolygon(resultParts);
}

// =====================================================================
// FUNÇÃO PRINCIPAL
// =====================================================================
(async function main() {
  try {
    // Conta total de registros no banco
    const total = (await executeQueryNet(`SELECT COUNT(*) AS cnt FROM ${TABLE}`)).recordset[0].cnt;

    const index = new RBush();  // Índice espacial para otimizar buscas
    const features = {};        // Cache de features por ID

    // ---- ETAPA 1: Indexação espacial por lotes ----
    for (let offset = 0; offset < total; offset += BATCH_SIZE) {
      const sqlRows = `
        SELECT ${ID_COLUMN} AS id, ${GEOJSON_COLUMN} AS geojson
        FROM ${TABLE}
        ORDER BY ${ID_COLUMN}
        OFFSET ${offset} ROWS FETCH NEXT ${BATCH_SIZE} ROWS ONLY
      `;
      const rows = (await executeQueryNet(sqlRows)).recordset;

      for (const r of rows) {
        const id = String(r.id).trim();
        const feat = normalizeGeoJSON(r.geojson, id);
        if (!feat) continue;

        try {
          // Calcula bounding box e insere no índice espacial
          const [minX, minY, maxX, maxY] = bbox(feat);
          index.insert({ minX, minY, maxX, maxY, id, feature: feat });
          features[id] = feat;
        } catch (e) {
          // Ignora registros com erro de bbox
        }
      }
    }

    // ---- ETAPA 2: Detecção de interseções ----
    const all = index.all();
    const seen = new Set();
    const intersections = [];

    for (const item of all) {
      const candidates = index.search(item);  // Busca candidatos próximos

      for (const c of candidates) {
        if (c.id === item.id) continue;  // Ignora comparação consigo mesmo
        
        // Evita processar o mesmo par duas vezes (A-B e B-A)
        const key = item.id < c.id ? `${item.id}-${c.id}` : `${c.id}-${item.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // Verifica se realmente há interseção
        let intersects = false;
        try { intersects = booleanIntersects(item.feature, c.feature); } catch {}
        if (!intersects) continue;

        // Registra informações da interseção
        const rec = { a: item.id, b: c.id, intersects: true, touches: false };
        try { rec.touches = booleanTouches(item.feature, c.feature); } catch {}
        
        // Calcula geometria e área da interseção
        try {
          const inter = safeIntersectionJSTS(item.feature, c.feature);
          if (inter) {
            rec.intersection = inter;
            rec.intersectionArea = area(inter);
          }
        } catch {}
        intersections.push(rec);
      }
    }

    // Calcula quantos CARs únicos têm interseções
    const carsComIntersecao = new Set();
    for (const inter of intersections) {
      carsComIntersecao.add(inter.a);
      carsComIntersecao.add(inter.b);
    }

    // ---- ETAPA 3: Correção de interseções ----
    const corrected = [];

    for (let i = 0; i < intersections.length; i++) {
      const { a: idA, b: idB, touches } = intersections[i];

      // Ignora geometrias que apenas se tocam (sem sobreposição real)
      if (touches) continue;

      const featA = features[idA];
      const featB = features[idB];

      // Pula se alguma geometria não foi encontrada
      if (!featA || !featB) continue;

      // Determina qual geometria é menor (será mantida) e qual é maior (será cortada)
      const areaA = area(featA);
      const areaB = area(featB);

      let featSmaller, featLarger, idSmaller, idLarger, areaSmaller, areaLarger;
      if (areaA < areaB) {
        // A é menor: manter A, cortar B
        featSmaller = featA;
        featLarger = featB;
        idSmaller = idA;
        idLarger = idB;
        areaSmaller = areaA;
        areaLarger = areaB;
      } else {
        // B é menor: manter B, cortar A
        featSmaller = featB;
        featLarger = featA;
        idSmaller = idB;
        idLarger = idA;
        areaSmaller = areaB;
        areaLarger = areaA;
      }

      // Calcula interseção entre as geometrias
      let inter = null;
      try {
        inter = safeIntersectionJSTS(featSmaller, featLarger);
      } catch (e) {
        // Ignora erro e continua
      }

      // Se não conseguiu, tenta com geometrias limpas
      if (!inter) {
        try {
          const cleanSmaller = cleanGeometry(featSmaller);
          const cleanLarger = cleanGeometry(featLarger);
          inter = safeIntersectionJSTS(cleanSmaller, cleanLarger);
        } catch (e) {
          // Ignora erro e continua
        }
      }

      const areaInter = inter ? area(inter) : 0;

      // Aplica buffer na geometria menor para garantir espaçamento mínimo (0.5 metros)
      let featSmallerWithGap = featSmaller;
      try {
        featSmallerWithGap = buffer(featSmaller, 0.5, { units: 'meters' });
      } catch (e) {
        // Se falhar o buffer, usa geometria original
        featSmallerWithGap = featSmaller;
      }

      // Aplica diferença (remove interseção + espaçamento da geometria maior)
      const diff = safeDifference(featLarger, featSmallerWithGap);
      if (!diff) continue;  // Pula se não conseguiu calcular

      // Calcula estatísticas da correção
      const newArea = area(diff);
      const reduction = areaLarger - newArea;

      // Registra resultado da correção
      corrected.push({
        campo_mantido: idSmaller,
        campo_modificado: idLarger,
        novas_coordenadas: {
          type: diff.geometry.type,
          coordinates: diff.geometry.coordinates
        },
        resumo: {
          area_original: `${areaLarger.toFixed(2)} m²`,
          area_reduzida: `${reduction.toFixed(2)} m²`,
          area_final: `${newArea.toFixed(2)} m²`,
          percentual_removido: `${((reduction / areaLarger) * 100).toFixed(2)}%`
        }
      });
    }

    // ---- ETAPA 4: Atualização das coordenadas corrigidas no banco ----
    let updatedCount = 0;
    /* COMENTADO - NÃO ATUALIZAR O BANCO
    for (const corr of corrected) {
      try {
        // Formata geometria corrigida como JSON string
        const geojsonCorrigido = JSON.stringify({
          type: corr.novas_coordenadas.type,
          coordinates: corr.novas_coordenadas.coordinates
        });

        // Log da primeira correção a ser enviada
        if (updatedCount === 0) {
          console.log('\n=== CORREÇÃO A SER ENVIADA ===');
          console.log('Campo modificado:', corr.campo_modificado);
          console.log('Geometria corrigida:', JSON.stringify({
            type: corr.novas_coordenadas.type,
            coordinates: corr.novas_coordenadas.coordinates
          }, null, 2));
          console.log('===============================\n');
        }

        // Atualiza coluna Z0C_GEOCOR com as coordenadas corrigidas
        const sqlUpdate = `
          UPDATE ${TABLE}
          SET Z0C_GEOCOR = @geocor
          WHERE ${ID_COLUMN} = @id
        `;
        
        await executeQueryNet(sqlUpdate, {
          geocor: geojsonCorrigido,
          id: corr.campo_modificado
        });
        
        updatedCount++;
      } catch (err) {
        console.error(`[ERRO] Falha ao atualizar ${corr.campo_modificado}:`, err.message);
      }
    }
    */

    // ---- ETAPA 5: Geração do arquivo de resultado ----
    const out = path.join(process.cwd(), 'intersections_result.json');
    const outputData = {
      data_geracao: new Date().toISOString(),
      total_cars_banco: total,
      total_cars_com_intersecao: carsComIntersecao.size,
      total_pares_intersecao: intersections.length,
      total_correcoes: corrected.length,
      registros_atualizados: updatedCount,
      correcoes: corrected
    };
    await fs.writeFile(out, JSON.stringify(outputData, null, 2), 'utf8');

    console.log(`\n✓ Processamento concluído:`);
    console.log(`  - Total de CARs no banco: ${total}`);
    console.log(`  - CARs com interseções: ${carsComIntersecao.size}`);
    console.log(`  - Pares de interseções encontradas: ${intersections.length}`);
    console.log(`  - Correções aplicadas: ${corrected.length}`);
    console.log(`  - Registros atualizados no banco: ${updatedCount}`);
    console.log(`  - Resultado salvo em: ${out}\n`);

  } catch (err) {
    console.error('[ERRO FATAL]', err);
  } finally {
    if (poolNet) await poolNet.close();
  }
})();
