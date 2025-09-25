export default class Silos {
    siloCod = "";
    siloDescr = "";
    SiloSetor = "";
    siloLote = "";
    siloPercOcup = "";
    siloCapac = "";
    siloSaldo = "";
    siloSaca = "";

    constructor(data?: Partial<Silos>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): Silos {
        return new Silos(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.siloCod = "";
    }
}