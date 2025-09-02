export default class SC2DTO {
    rec = 0;
    op = "";
    data = "";
    gds = "";
    peso = "";
    sacas = "";
    refer = "";
    servico = "";

    constructor(data?: Partial<SC2DTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): SC2DTO {
        return new SC2DTO(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.rec = 0;
    }
}