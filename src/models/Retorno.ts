export default class Retorno {
    code: number = 0;
    type: string = "";
    message: string = "";
    data: string = "";
    recno: string = "";
    retorno: string = "";

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
        this.code = 0;
    }
}