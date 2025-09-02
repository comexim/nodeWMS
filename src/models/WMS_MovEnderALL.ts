import Labels from "./Labels";
import WMS_MovEnderDTO from "./WMS_MovEnderDTO";

export default class WMS_MovEnderALL {
    listMov = WMS_MovEnderDTO;
    labelMap = Labels;

    constructor(data?: Partial<WMS_MovEnderALL>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_MovEnderALL {
        return new WMS_MovEnderALL(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.listMov = WMS_MovEnderDTO;
        this.labelMap = Labels;
    }
}