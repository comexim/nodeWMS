export default class Retorno {
    oSID: string = "";
    motCod: string = "";
    oSOpTck: string = "";
    oSPrioridade: string = "";
    oSBlocoSuger: string = "";
    oSData: string = "";
    oSHora: string = "";
    oSStatus: string = "";

    constructor(data?: Partial<Retorno>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): Retorno {
        return new Retorno(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.oSID = "";
    }
}