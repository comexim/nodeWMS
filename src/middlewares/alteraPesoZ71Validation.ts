import Retorno from "../models/Retorno";
import Z71DTO from "../models/Z71DTO";

export function alteraPesoZ71Validation (dados: Z71DTO): Retorno | null {
        if (!dados.rec)
            return new Retorno({ code: 400, type: "Error", message: "Campo rec necessário!" });
        if (!dados.peso)
            return new Retorno({ code: 400, type: "Error", message: "Campo Peso necessário!"});
        return null;
}