export default class WMS_EnderColorDTO {
    enderCod = "";
    enderTag = "";
    enderStatus = "";
    enderSacas = "";
    enderX1 = "";
    enderX2 = "";
    enderY1 = "";
    enderY2 = "";
    enderWebX1 = "";
    enderWebX2 = "";
    enderWebY1 = "";
    enderWebY2 = "";
    cor = "";
    bagLote = "";
    
    constructor(data?: Partial<WMS_EnderColorDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_EnderColorDTO {
        return new WMS_EnderColorDTO(data);
    }
}