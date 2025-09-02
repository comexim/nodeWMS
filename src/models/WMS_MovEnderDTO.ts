export default class WMS_MovEnderDTO {
    oSID = "";
    itOsItem = "";
    bagTag = "";
    bagLote = "";
    enderTag = "";
    enderCod = "";
    motCod = "";
    movEnderData = "";
    movEnderHora = "";
    movEnderTipo = "";
    movEnderPeso = "";
    movEnderPesoSoltar = "";

    constructor(data?: Partial<WMS_MovEnderDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_MovEnderDTO {
        return new WMS_MovEnderDTO(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.oSID = "";
    }
}