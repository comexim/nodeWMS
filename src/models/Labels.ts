export default class Labels {
    key = "";
    label = "";
    exibe = "";

    constructor(data?: any) {
        if (data) {
            this.key = data.GridData ?? "";
            this.label = data.GridLabel ?? "";
            this.exibe = data.GridExibe ?? "";
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): Labels {
        return new Labels(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.key = "";
    }
}