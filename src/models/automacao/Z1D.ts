export default class Z1D {
    z1d_filial: string = "";
    z1d_ticket: string = "";
    z1d_tipove: string = "";
    z1d_lona: string = "";
    z1d_sacar: string = "";
    z1d_assoa: string = "";
    z1d_resid: string = "";
    z1d_odor: string = "";
    z1d_molhad: string = "";
    z1d_arcos: string = "";
    z1d_pinos: string = "";
    z1d_tampas: string = "";

    constructor(data?: Partial<Z1D>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): Z1D {
        return new Z1D(data);
    }

    // Método para limpar os dados
    clear(): void {
        this.z1d_filial = "";
        this.z1d_ticket = "";
        this.z1d_tipove = "";
        this.z1d_lona = "";
        this.z1d_sacar = "";
        this.z1d_assoa = "";
        this.z1d_resid = "";
        this.z1d_odor = "";
        this.z1d_molhad = "";
        this.z1d_arcos = "";
        this.z1d_pinos = "";
        this.z1d_tampas = "";
    }
}