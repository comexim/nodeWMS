export default class WMS_ApImasDTO {
    apLote = "";
    apEquipto = "";
    apQuant = 0;
    apObs = "";
    apData = "";
    apHora = "";

    constructor(data?: Partial<WMS_ApImasDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_ApImasDTO {
        return new WMS_ApImasDTO(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.apLote = "";
    }
}