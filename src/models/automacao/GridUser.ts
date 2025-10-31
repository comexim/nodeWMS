export default class GridUser {
    gridID = "";
    userLogin = "";
    gridLabel = "";
    gridData = "";
    gridNdx = 0;
    gridExibe = "";

    constructor(data?: Partial<GridUser>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): GridUser {
        return new GridUser(data);
    }

}