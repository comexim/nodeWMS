import Labels from "./Labels";
import WMS_Parada from "./WMS_Parada";

export default class WMS_RuaDTO {
    rua = "";
    coordIni = "";
    coordFim = "";

    constructor(data?: Partial<WMS_RuaDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_RuaDTO {
        return new WMS_RuaDTO(data);
    }
}