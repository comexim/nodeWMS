export default class TagValues {
    tagID = "";
    tagEnder = "";
    enderCod = "";
    tagStatus = "";
    tagLote = "";
    lote = "";
    tipo = "";
    peso = "";

    constructor(data?: Partial<TagValues>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): TagValues {
        return new TagValues(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.tagID = "";
    }
}