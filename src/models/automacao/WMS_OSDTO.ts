export default class WMS_OSDTO {
    oSID: string = "";
    motCod: string = "";
    oSOpTck: string = "";
    oSPrioridade: string = "";
    oSBlocoSuger: string = "";
    oSData: string = "";
    oSHora: string = "";
    oSStatus: string = "";

    constructor(data?: Partial<WMS_OSDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_OSDTO {
        return new WMS_OSDTO(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.oSID = "";
    }
}