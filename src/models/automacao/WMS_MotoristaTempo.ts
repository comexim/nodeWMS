export default class WMS_MotoristaTempo {
    motCod = "";
    bagTag = "";
    movEnderData = "";
    minHora = "";
    maxHora = "";

    constructor(data?: Partial<WMS_MotoristaTempo>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_MotoristaTempo {
        return new WMS_MotoristaTempo(data);
    }
}