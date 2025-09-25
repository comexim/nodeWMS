export default class ContasPagar_DTO {
    filial = "";
    numero = "";
    centroCusto = "";
    natureza = "";
    aprovador = "";
    aprovador2 = "";
    banco = "";
    emissao = "";
    vencimento = "";
    pagamento = "";
    moeda = "";
    moedaStr = "";
    valor = "";
    juros = "";
    decrescimo = "";
    acrescimo = "";
    fornecedor = "";

    constructor(data?: Partial<ContasPagar_DTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): ContasPagar_DTO {
        return new ContasPagar_DTO(data);
    }
}