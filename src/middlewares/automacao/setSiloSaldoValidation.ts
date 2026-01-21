import MovSilos from "../../models/automacao/MovSilos";
import Retorno from "../../models/automacao/Retorno";

export async function setSiloSaldoValidation (dados: MovSilos): Promise<Retorno | null> {
    if (!dados.siloCod) return new Retorno ({ code: 400, type: "error", message: "Campo siloCod necessário!"});
    if (!dados.movSiloData) return new Retorno ({ code: 400, type: "error", message: "Campo movSiloData necessário!"});
    if (!dados.movSiloHora) return new Retorno ({ code: 400, type: "error", message: "Campo movSiloHora necessário!"});
    if (!dados.movSiloLote) return new Retorno ({ code: 400, type: "error", message: "Campo movSiloLote necessário!"});
    return null;
}