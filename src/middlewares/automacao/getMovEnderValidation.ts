import Retorno from "../../models/automacao/Retorno";

export function getMovEnderValidation(dataIni: string, dataFim: string, tipo: string, usuario: string): Retorno | null {
    if (!dataIni)
        return new Retorno({ code: 400, type: "Error", message: "Campo dataIni necessário!" });
    if (!dataFim)
        return new Retorno({ code: 400, type: "Error", message: "Campo dataFim necessário!" });
    if (!tipo)
        return new Retorno({ code: 400, type: "Error", message: "Campo tipo necessário!" });
    if (!usuario)
        return new Retorno({ code: 400, type: "Error", message: "Campo usuario necessário!" });
    return null;
}