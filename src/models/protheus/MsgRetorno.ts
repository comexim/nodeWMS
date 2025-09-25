export default class MsgRetorno {
    codRet = "";
    descrRet = "";
    data = {};

    constructor(data?: Partial<MsgRetorno>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): MsgRetorno {
        return new MsgRetorno(data);
    }
}