export default class WMS_EnderecoDTO {
    enderCod: string = "";
    enderTag: string = "";
    bagLote: string = "";
    bagTag: string = "";
    enderBloco: string = "";
    enderQuadra: string = "";
    enderPosicao: string = "";
    enderNivel: string = "";
    enderLinha: string = "";
    enderTipo: string = "";
    enderStatus: string = "";
    enderX1: string = "";
    enderX2: string = "";
    enderY1: string = "";
    enderY2: string = "";
    peso: string = "";
    sacas: string = "";
    linha: string = "";
    pen17: string = "";
    pen14: string = "";
    pVA: string = "";
    grinder: string = "";
    impureza: string = "";
    safra: string = "";
    empSN: string = "";
    empPeso: string = "";
    osNum: string = "";

    constructor(data?: Partial<WMS_EnderecoDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para validar se o endereço está válido
    isValid(): boolean {
        return this.enderCod.trim() !== "" && this.enderCod !== "ZZZZZZZ";
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_EnderecoDTO {
        return new WMS_EnderecoDTO(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.enderCod = "";
    }
}