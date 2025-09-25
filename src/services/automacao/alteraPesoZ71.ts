import Retorno from "../../models/automacao/Retorno";
import Z71DTO from "../../models/automacao/Z71DTO";
import { executeQueryLocal, getDataAtual, getMovSiloID, getSilo, updSiloSaldo } from "../../utils/dbExecute";

export async function alteraPesoZ71(dados: Z71DTO): Promise<Retorno> {
try {
        if (dados.setor && dados.setor.trim() !== "-" && dados.setor.trim().length > 0) {

            const sqlAux = `INSERT INTO SUP_MovSilo (MovSiloID, MovID, SiloCod, MovSiloSaldoAnt, MovSiloQuant, MovSiloSaldoFim, MovSiloData, MovSiloHora, MovSiloES, MovSiloLote) 
                            VALUES(@movSiloID, '99', @setor, '0.0', @peso, @peso, @dataAtu, @horaAtu, 'E', @lote)`

            const movSiloID = await getMovSiloID();
            console.log("MovSiloID", movSiloID)
            const dataAtu = await getDataAtual();
            const horaAtu = await getDataAtual(true);
            
            const params = {
                movSiloID,
                setor: dados.setor,
                peso: dados.peso,
                dataAtu,
                horaAtu,
                lote: dados.lote
            }

            await executeQueryLocal(sqlAux, params);

            const lstSilos = await getSilo(dados.setor);
            await updSiloSaldo(lstSilos, dados.peso, "E", dados.lote)
        }

        // Executa a atualização de Z71010
        const sql = `UPDATE Z71010 SET Z71_PESO = @peso WHERE R_E_C_N_O_ = @rec`
        await executeQueryLocal(sql, { peso: dados.peso, rec: dados.rec });

        return new Retorno({
            code: 600,
            type: "Success",
            message: `Dado alterado com o recno ${dados.rec}`
        })
    } catch (error) {
        return new Retorno ({
            code: 500,
            type: "SQL",
            message: `Erro: ${error}`
        })
    }
}