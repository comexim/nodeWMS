import MovSilos from "../../models/automacao/MovSilos";
import Retorno from "../../models/automacao/Retorno";
import { executeQueryLocal } from "../../utils/dbExecute";

export async function setSiloSaldo (dados: MovSilos): Promise<Retorno> {
    try {
        // Calculando próximo MovID
        const maxMovIDSql = `SELECT MAX(MovID) AS maxMovID FROM SUP_MovSilo`;
        const maxMovIDResult = await executeQueryLocal(maxMovIDSql, {});
        const maxMovID = maxMovIDResult.recordset[0]?.maxMovID;
        const newMovID = maxMovID ? maxMovID + 1 : 1;

        // Calculando próximo MovSiloID
        const maxMovSiloIDSql = `SELECT MAX(MovSiloID) AS maxMovSiloID FROM SUP_MovSilo`;
        const maxMovSiloIDResult = await executeQueryLocal(maxMovSiloIDSql, {});
        const maxMovSiloID = maxMovSiloIDResult.recordset[0]?.maxMovSiloID;
        const newMovSiloID = maxMovSiloID ? maxMovSiloID + 1 : 1;

        console.log('newMovID calculado:', newMovID);
        console.log('newMovSiloID calculado:', newMovSiloID);

        const movSiloES = dados.movSiloQuant > 0 ? "E" : "S";

        // Incluindo tanto MovSiloID quanto MovID no INSERT
        const sql = `INSERT INTO SUP_MovSilo (MovSiloID, MovID, SiloCod, MovSiloSaldoAnt, MovSiloQuant, MovSiloSaldoFim, MovSiloData, MovSiloHora, MovSiloES, MovSiloLote, MovSiloObs)
                        VALUES (@movSiloID, @movID, @siloCod, @movSiloSaldoAnt, @movSiloQuant, @movSiloSaldoFim, @movSiloData, @movSiloHora, @movSiloES, @movSiloLote, @movSiloObs)`;

        const sqlAux = `UPDATE SUP_Silos SET SiloSaldo = 0, SiloLote = '' WHERE SiloCod = @siloCod`;

        const params = {
            movSiloID: newMovSiloID,
            movID: newMovID, 
            siloCod: dados.siloCod,
            movSiloSaldoAnt: dados.movSiloSaldoAnt,
            movSiloQuant: dados.movSiloQuant,
            movSiloSaldoFim: 0,
            movSiloData: dados.movSiloData,
            movSiloHora: dados.movSiloHora,
            movSiloES: movSiloES, 
            movSiloLote: dados.movSiloLote,
            movSiloObs: dados.movSiloObs
        };

        const response = await executeQueryLocal(sql, params);
        if (response.rowsAffected === 0) {
            return new Retorno({
                code: 400,
                type: "Error",
                message: "Falha ao inserir dados na tabela SUP_MovSilos."
            });
        }

        const responseAux = await executeQueryLocal(sqlAux, { siloCod: dados.siloCod });
        if (responseAux.rowsAffected === 0) {
            return new Retorno({
                code: 400,
                type: "Error",
                message: "Falha ao atualizar a tabela SUP_Silos."
            });
        }

        return new Retorno({
            code: 200,
            type: "Success",
            message: "Operação realizada com sucesso."
        });
    } catch (error) {
        return new Retorno({
            code: 500,
            type: "Error",
            message: `${error}`
        });
    }
}