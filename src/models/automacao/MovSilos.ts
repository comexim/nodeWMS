export default class MovSilos {
    siloCod = "";
    movSiloID = 0;
    movID = 0;
    movSiloSaldoAnt = 0;
    movSiloSaldoFim = 0;
    movSiloQuant = 0;
    movSiloData = "";
    movSiloHora = "";
    movSiloES = "";
    movSiloLote = "";
    movSiloObs = "";

    constructor(data?: Partial<MovSilos>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): MovSilos {
        return new MovSilos(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.siloCod = "";
    }
}