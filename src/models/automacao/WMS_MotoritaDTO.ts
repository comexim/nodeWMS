export default class WMS_MotoristaDTO {
    motCod = "";
    totalHoras = "";
    quantidadeBags = 0;
    bagsDetalhados: Array<{
        bagTag: string;
        data: string;
        horaInicio: string;
        horaFim: string;
    }> = [];
    bagsPorHora = 0;

    constructor(data?: Partial<WMS_MotoristaDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_MotoristaDTO {
        return new WMS_MotoristaDTO(data);
    }
}
