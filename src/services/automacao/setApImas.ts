import Retorno from "../../models/automacao/Retorno";
import WMS_ApImasDTO from "../../models/automacao/WMS_ApImasDTO";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function setApImas(dados: WMS_ApImasDTO): Promise<Retorno> {
    try {
        const sql = `INSERT INTO WMS_ApImas(
                        ApLote,
                        ApEquipto,
                        ApQuant,
                        ApObs,
                        ApData,
                        ApHora)
                        VALUES(
                        @apLote,
                        @apEquipto,
                        @apQuant,
                        @apObs,
                        @apData,
                        @apHora)
                        `;

        const params = {
            apLote: dados.apLote,
            apEquipto: dados.apEquipto,
            apQuant: dados.apQuant,
            apObs: dados.apObs || "",
            apData: dados.apData,
            apHora: dados.apHora
        };

        await executeQueryLocal(sql, params);

        return new Retorno({
            code: 601,
            type: "Success",
            message: "Apontamento inserido com sucesso!"
        });
    } catch (error: any) {
        // Trata o erro de chave duplicada
        if (error.code === "EREQUEST" && error.message.includes("Violation of PRIMARY KEY constraint")) {
            return new Retorno({
                code: 500,
                type: "Error",
                message: "Erro: Lote já registrado nesse equipamento!"
            });
        }

        // Trata outros erros
        return new Retorno({
            code: 500,
            type: "Error",
            message: `Erro: ${error.message}`
        });
    }
}