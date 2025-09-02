export default class WMS_ItemOSDTO {
    oSID: string = "";
    itOSItem: string = "";
    empiCod: string = "";
    motCod: string = "";
    prioridade: string = "";
    itOSData: string = "";
    itOSHora: string = "";
    itOSLote: string = "";
    itOsTagBag: string = "";
    itOsOrigem: string = "";
    itOsTagOrigem: string = "";
    itOsDestino: string = "";
    itOsTagDestino: string = "";
    itOSStatus: string = "";
    lote: string = "";
    opTck: string = "";
    itOsLibEnder: string = "";
    itOsPeso: string = "";
    itOsObs: string = "";
    totRegistros: string = "";
    osData: string = "";
    oSHora: string = "";
    oSBlocoSuger: string = "";
    oSPrioridade: string = "";
    itOsPesoSoltar: string = "";
    oSStatus: string = "";

    constructor(data?: Partial<WMS_ItemOSDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_ItemOSDTO {
        return new WMS_ItemOSDTO(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.oSID = "";
    }
}