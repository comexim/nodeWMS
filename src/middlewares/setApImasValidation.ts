import Retorno from "../models/Retorno";
import WMS_ApImasDTO from "../models/WMS_ApImasDTO";

export async function setApImasValidation(dados: WMS_ApImasDTO): Promise<Retorno | null> {
    if(!dados.apEquipto) return new Retorno ({ code: 400, type: "Error", message: "Campo apEquipto necessário!"});
    if(!dados.apLote) return new Retorno ({ code: 400, type: "Error", message: "Campo apLote necessário!"});
    if(!dados.apQuant) return new Retorno ({ code: 400, type: "Error", message: "Campo apQuant necessário!"});
    if(!dados.apData) return new Retorno ({ code: 400, type: "Error", message: "Campo apData necessário!"});
    if(!dados.apHora) return new Retorno ({ code: 400, type: "Error", message: "Campo apHora necessário!"});
    return null;
}