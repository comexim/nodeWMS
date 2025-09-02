import Z71DTO from "../models/Z71DTO";
import Retorno from "../models/Retorno";

export function setZ71Validation(dados: Z71DTO): Retorno | null {
    if (!dados.op || dados.op.length > 6)
        return new Retorno({ code: 400, type: "Error", message: "Campo OP necessário ou maior que 6 dígitos!" });
    if (!dados.data)
        return new Retorno({ code: 400, type: "Error", message: "Campo Data necessário!"});
    if (!dados.hora)
        return new Retorno({ code: 400, type: "Error", message: "Campo Hora necessário!"});
    if (!dados.lote || dados.lote.length > 13)
        return new Retorno({ code: 400, type: "Error", message: "Campo lote necessário ou maior que 13 dígitos!"});
    if (!dados.tag)
        return new Retorno({ code: 400, type: "Error", message: "Campo Tag necessário!"});
    if (!dados.linha)
        return new Retorno({ code: 400, type: "Error", message: "Campo Linha necessário!"});
    return null;
}