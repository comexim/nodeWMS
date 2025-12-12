import WMS_EnderecoDTO from "./WMS_EnderecoDTO";
import WMS_ItemOSDTO from "./WMS_ItemOSDTO";
import WMS_OSDTO from "./WMS_OSDTO";

export default class WMS_OSInsert {
    wms_os: WMS_OSDTO = {} as WMS_OSDTO;
    wms_itemos: WMS_ItemOSDTO[] = [];
    listaEnder: WMS_EnderecoDTO[] = [];

    constructor(data?: Partial<WMS_OSInsert>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Método para criar a partir de dados (útil para banco/API)
    static from(data: any): WMS_OSInsert {
        return new WMS_OSInsert(data);
    }
}