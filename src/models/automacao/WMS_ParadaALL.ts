import Labels from "./Labels";
import WMS_Parada from "./WMS_Parada";

export default class WMS_ParadaALL {
    listaMov: WMS_Parada[] = [];
    labelMap: Labels[] = [];

    constructor(data?: Partial<WMS_ParadaALL>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_ParadaALL {
        return new WMS_ParadaALL(data);
    }
}