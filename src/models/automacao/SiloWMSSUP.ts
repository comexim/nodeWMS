export default class SilosWMSSUP {
    codigo = "";
    capacidade = "";
    saldowms = "";
    sup = "";
    difer = "";
    lote = "";

    constructor(data?: Partial<SilosWMSSUP>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): SilosWMSSUP {
        return new SilosWMSSUP(data);
    }
}