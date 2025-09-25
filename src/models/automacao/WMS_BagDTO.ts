export default class WMS_BagDTO {
    bagTag = "";
    bagLote = "";
    bagStatus = "";
    bagAtuEnder = "";
    bagUltEnder = "";
    tagAtuEnder = "";
    osID = "";
    ItOSItem = "";
    bagLinha = "";
    bagPen17 = "";
    bagPen14 = "";
    bagPva = "";
    bagGrinder = "";
    BagImpureza = "";
    bagSafra = "";
    opTck = "";
    bagKgAtu = 0;
    bagKgCorte = 0;

    constructor(data?: Partial<WMS_BagDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_BagDTO {
        return new WMS_BagDTO(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.bagTag = "";
    }
}