export default class WMS_SeqOpDTO {
    seqOpNum = "";
    seqOpLote = "";
    seqOpPeneira = "";
    seqOpServico = "";
    seqOpDestino = "";
    seqOpData = "";
    seqOpHora = "";
    seqOpStatus = "";
    refere = "";
    seqOpVC = "";
    seqOpPeso = 0;
    seqOpSacas = 0;
    seqOpBags = 0;
    seqOpID = 0;

    constructor(data?: Partial<WMS_SeqOpDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_SeqOpDTO {
        return new WMS_SeqOpDTO(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.seqOpNum = "";
    }
}