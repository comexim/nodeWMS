import Z1D from "./Z1D";

export default class Z1A {
    recno: number = 0;
    filial: string = "";
    ticket: string = "";
    tipo: string = "";
    placa1: string = "";
    placa2: string = "";
    placa3: string = ""
    motorista: string = "";
    transportadora: string = "";
    embalagem: string = "";
    nomeemb: string = "";
    origem: string = "";
    pesoInfo: number = 0;
    pesoEnt: number = 0;
    pesoSai: number = 0;
    dataEnt: string = "";
    horaEnt: string = "";
    dataSai: string = "";
    horaSai: string = "";
    pesoLiq: number = 0;
    pesoFrete: number = 0;
    observ: string = "";
    valFrete: number = 0;
    intRh: string = "";
    codAuton: string = "";
    numFolha: string = "";
    pesoMin: number = 0;
    qtdPesagem: number = 0;
    numPesagem: number = 0;
    status: string = "";
    pedido: string = "";
    solicitacao: string = "";
    fornecedor: string = "";
    linha: string = "";
    numVols: string = "";
    numOP: string = "";
    codLoteOp: string = "";
    moega: string = "";
    cicloD: string = "";
    padrCi: string = "";
    txPerf: string = "";
    codJus: string = "";
    chkLst: Z1D[] = [];
    private List<Z1C> notas;

    constructor(data?: Partial<Z1A>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): Z1A {
        return new Z1A(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.code = 0;
    }
}