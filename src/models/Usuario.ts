export default class Usuario {
    login = "";
    senha = "";
    token = "";

    constructor(data?: Partial<Usuario>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): Usuario {
        return new Usuario(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.login = "";
    }
}