export default class SD4_DTO {
    local = "";
    qtdori = "";
    quant = "";
    lote = "";

    constructor(data?: Partial<SD4_DTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): SD4_DTO {
        return new SD4_DTO(data);
    }
}