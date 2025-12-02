import Silos from "./Silos";

export default class SUP_SilosALL {
    capTotalSc = "";
    capTotalKg = "";
    capOcupSc = "";
    capOcupKg = "";
    percOcup = "";
    listaSilos: Silos[] = [];

    constructor(data?: Partial<SUP_SilosALL>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): SUP_SilosALL {
        return new SUP_SilosALL(data);
    }
}