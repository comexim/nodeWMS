export default class Usuario {
    telefone = "";
    nome = "";
    mail = "";
    token = "";
    direitos ={};

    constructor(data?: Partial<Usuario>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): Usuario {
        return new Usuario(data);
    }
}