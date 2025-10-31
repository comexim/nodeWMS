export default class WMS_Parada {
    parID = "";
    maqCod = "";
    parDataIni = "";
    parHoraini = "";
    parDataFim = "";
    parTipo = "";
    parOP = "";
    userCod = "";
    parMotivo = "";
    parQtdVez = "";
    parPeneira = "";

    constructor(data?: Partial<WMS_Parada>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_Parada {
        return new WMS_Parada(data);
    }
}