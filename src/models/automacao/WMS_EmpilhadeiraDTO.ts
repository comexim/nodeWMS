export default class WMS_EmpilhadeiraDTO {
    empicod = "";
    empidescr = "";

    constructor(data?: Partial<WMS_EmpilhadeiraDTO>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_EmpilhadeiraDTO {
        return new WMS_EmpilhadeiraDTO(data);
    }
}