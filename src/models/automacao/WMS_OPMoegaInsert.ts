import WMS_EnderColorDTO from "./WMS_EnderColorDTO";

export default class WMS_OPMoegaInsert {
    op = "";
    empicod = "";
    listaEnder: WMS_EnderColorDTO[] = [];

    constructor(data?: Partial<WMS_OPMoegaInsert>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_OPMoegaInsert {
        return new WMS_OPMoegaInsert(data);
    }
}