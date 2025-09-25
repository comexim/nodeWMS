export default class Z71DTO {
    rec: number = 0;
    filial: string = "";
    op: string = "";
    data: string = "";
    hora: string = "";
    lote: string = "";
    peso: number = 0;
    sacas: number = 0;
    setor: string = "";
    seq: number = 0;
    tag: string = "";
    approd: string = "";
    vols: string = "";
    embal: string = "";
    chvSeq: string = "";
    linha: string = "";
    nQtdIns: number = 0;
    opTck: string = "";
    seqOpId: number = 0;
    usuCod: string = "";
    tag_short: string = "";

    constructor(data?: Partial<Z71DTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): Z71DTO {
        return new Z71DTO(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.rec = 0;
    }
}