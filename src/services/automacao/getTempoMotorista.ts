import Retorno from "../../models/automacao/Retorno";
import WMS_MotoristaDTO from "../../models/automacao/WMS_MotoritaDTO";
import { executeQueryLocal } from "../../utils/dbExecute";

/** Converte hora "HH:mm" em minutos */
const horaParaMinutos = (hora: string): number => {
    const [h, m] = hora.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
};

/** Converte minutos em "HH:mm" */
const minutosParaHora = (minutos: number): string => {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** Junta data + hora em um objeto Date */
const parseDataHora = (data: string, hora: string): Date => {
    const ano = parseInt(data.substring(0, 4));
    const mes = parseInt(data.substring(4, 6)) - 1;
    const dia = parseInt(data.substring(6, 8));
    const [h, m] = hora.split(":").map(Number);
    return new Date(ano, mes, dia, h, m);
};

/**
 * Calcula o tempo efetivo total de uma lista de intervalos (bags)
 * considerando pausas curtas (até 60min) como parte do trabalho
 * e pausas longas como descanso.
 */
const calcularTempoEfetivo = (periodos: { inicio: Date; fim: Date }[]): number => {
    if (periodos.length === 0) return 0;

    // Ordenar por data/hora de início
    const ordenados = [...periodos].sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

    let tempoTotalMin = 0;
    let blocoInicio = ordenados[0]!.inicio;
    let blocoFim = ordenados[0]!.fim;

    for (let i = 1; i < ordenados.length; i++) {
        const atual = ordenados[i]!;
        const diffMin = (atual.inicio.getTime() - blocoFim.getTime()) / 60000;

        if (diffMin <= 60) {
            // pausa curta (<= 60 min) → continua o mesmo bloco
            blocoFim = new Date(Math.max(blocoFim.getTime(), atual.fim.getTime()));
        } else {
            // pausa longa → fecha o bloco e inicia outro
            tempoTotalMin += (blocoFim.getTime() - blocoInicio.getTime()) / 60000;
            blocoInicio = atual.inicio;
            blocoFim = atual.fim;
        }
    }

    // soma o último bloco
    tempoTotalMin += (blocoFim.getTime() - blocoInicio.getTime()) / 60000;
    return tempoTotalMin;
};

export async function getTempoMotorista(optck: string, osid: string): Promise<{
    motoristas: WMS_MotoristaDTO[],
    cortes: { totalHoras: string, quantidadeBags: number, bagsDetalhados: any[] }[]
}> {
    try {
        // ========= CONSULTA MOTORISTAS =========
        const sqlMotorista = `
            SELECT 
                m.MotCod, 
                BagTag, 
                MovEnderData, 
                m.OSID,
                MIN(MovEnderHora) as MinHora, 
                MAX(MovEnderHora) as MaxHora
            FROM WMS_MovEnder m, WMS_OS o
            WHERE m.OSID = o.OSID
              AND OSOpTck = @optck
              AND m.OSID = @osid
              AND m.MovEnderTipo IN ('PEG', 'SOL')
            GROUP BY m.MotCod, BagTag, MovEnderData, m.OSID
            ORDER BY m.MotCod, MovEnderData, Min(MovEnderHora)
        `;

        const { recordset: recordsetMotorista } = await executeQueryLocal(sqlMotorista, { optck, osid });

        const motoristas = new Map<string, { periodos: { inicio: Date; fim: Date; data: string; bagTag: string }[] }>();

        // Organiza os dados por motorista
        recordsetMotorista.forEach((reg: any) => {
            const motCod = reg.MotCod.trim();
            const inicio = parseDataHora(reg.MovEnderData.trim(), reg.MinHora.trim());
            const fim = parseDataHora(reg.MovEnderData.trim(), reg.MaxHora.trim());

            if (!motoristas.has(motCod)) {
                motoristas.set(motCod, { periodos: [] });
            }

            motoristas.get(motCod)!.periodos.push({
                inicio,
                fim,
                data: reg.MovEnderData.trim(),
                bagTag: reg.BagTag.trim()
            });
        });

        // ========= PROCESSA TEMPOS =========
        const motoristasArray = Array.from(motoristas.entries()).map(([motCod, { periodos }]) => {
            if (periodos.length === 0) return null;

            // Tempo bruto (do primeiro início ao último fim)
            const primeiroInicio = periodos.reduce((a, b) => (a.inicio < b.inicio ? a : b)).inicio;
            const ultimoFim = periodos.reduce((a, b) => (a.fim > b.fim ? a : b)).fim;
            const tempoBrutoMin = (ultimoFim.getTime() - primeiroInicio.getTime()) / 60000;

            // Tempo efetivo (sem pausas longas)
            const tempoEfetivoMin = calcularTempoEfetivo(periodos);

            return WMS_MotoristaDTO.from({
                motCod,
                totalHorasEfetivas: minutosParaHora(Math.round(tempoEfetivoMin)),
                totalHorasBrutas: minutosParaHora(Math.round(tempoBrutoMin)),
                quantidadeBags: periodos.length,
                bagsDetalhados: periodos.map(p => ({
                    bagTag: p.bagTag,
                    data: p.data,
                    horaInicio: `${p.inicio.getHours().toString().padStart(2, "0")}:${p.inicio.getMinutes().toString().padStart(2, "0")}`,
                    horaFim: `${p.fim.getHours().toString().padStart(2, "0")}:${p.fim.getMinutes().toString().padStart(2, "0")}`
                })),
                bagsPorHora: Math.floor(periodos.length / Math.max(1, tempoEfetivoMin / 60))
            });
        }).filter(Boolean) as WMS_MotoristaDTO[];

        // ========= CONSULTA CORTES =========
        const sqlCortes = `
            SELECT 
                m.MotCod, 
                BagTag, 
                MovEnderData, 
                MIN(MovEnderHora) as MinHora, 
                MAX(MovEnderHora) as MaxHora
            FROM WMS_MovEnder m, WMS_OS o
            WHERE m.OSID = o.OSID
              AND OSOpTck = @optck
              AND m.MovEnderTipo IN ('COR', 'CRT')
            GROUP BY m.MotCod, BagTag, MovEnderData
            ORDER BY m.MotCod
        `;

        const { recordset: recordsetCortes } = await executeQueryLocal(sqlCortes, { optck });
        const cortesMap = new Map<string, { totalMinutos: number, bagsDetalhados: any[] }>();

        recordsetCortes.forEach((reg: any) => {
            const motCod = reg.MotCod.trim();
            const minutos = horaParaMinutos(reg.MaxHora) - horaParaMinutos(reg.MinHora);
            const minutosTrabalho = Math.max(1, minutos);

            if (!cortesMap.has(motCod)) {
                cortesMap.set(motCod, { totalMinutos: 0, bagsDetalhados: [] });
            }

            const corte = cortesMap.get(motCod)!;
            corte.totalMinutos += minutosTrabalho;
            corte.bagsDetalhados.push({
                bagTag: reg.BagTag.trim(),
                data: reg.MovEnderData.trim(),
                horaInicio: reg.MinHora.trim(),
                horaFim: reg.MaxHora.trim()
            });
        });

        const cortes = Array.from(cortesMap.values()).map(corte => ({
            totalHoras: minutosParaHora(corte.totalMinutos),
            quantidadeBags: corte.bagsDetalhados.length,
            bagsDetalhados: corte.bagsDetalhados
        }));

        return {
            motoristas: motoristasArray.sort((a, b) => a.motCod.localeCompare(b.motCod)),
            cortes
        };
    } catch (error) {
        throw new Retorno({
            code: 501,
            message: `Erro Interno: ${error}`
        });
    }
}
