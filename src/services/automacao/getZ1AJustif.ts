import Retorno from "../../models/automacao/Retorno";
import Z1A from "../../models/automacao/Z1A";
import Z1A_ALL from "../../models/automacao/Z1A_ALL";
import { executeQueryNet, getGridCollum } from "../../utils/dbExecute";

export async function getZ1AJustif (ticket: string, dataIni: string, dataFim: string, usuario: string) {
    let sql = `SELECT
                Z1A.Z1A_TICKET,Z1A.Z1A_PLACA1, Z1A.Z1A_PLACA2, Z1A.Z1A_PLACA3, Z1A.Z1A_DATAEN,
                Z1A.Z1A_HORAEN,Z1A.Z1A_HORASA,Z1A.Z1A_EMBAL,Z1A.Z1A_MOEGA,Z1A.Z1A_CICLOD,Z1A.Z1A_PADRCI,
                Z1A.Z1A_TXPERF,Z1A.Z1A_CODJUS,R_E_C_N_O_ AS Z1A_Recno,
                (
                CASE WHEN Z1A.Z1A_PESOSA = 0 THEN Z1A.Z1A_PESOIN/59 ELSE
                (Z1A.Z1A_PESOEN - Z1A.Z1A_PESOSA)/59
                END) as SACAS
                FROM Z1A010 Z1A
                WHERE
                Z1A.D_E_L_E_T_ <> '*' AND
                Z1A.Z1A_MOEGA <> ''   AND
                Z1A.Z1A_DATASA <> ''`;

    if(ticket.trim().length > 0) {
        sql += ` AND Z1A.Z1A_TICKET = @ticket`;
    } else {
        sql += ` AND Z1A.Z1A_DATAEN >= @dataIni`;
        sql += ` AND Z1A.Z1A_DATAEN <= @dataFim`;
    }
    sql += ` ORDER BY Z1A_TICKET, Z1A_DATAEN ASC`;
    try {
        const response = await executeQueryNet(sql, {ticket, dataIni, dataFim});

        const ListaZ1A = response.recordset.map((item: any) => {
            const z1a = new Z1A();
            z1a.ticket = item.Z1A_TICKET;
            z1a.placa1 = item.Z1A_PLACA1;
            z1a.placa2 = item.Z1A_PLACA2;
            z1a.placa3 = item.Z1A_PLACA3;
            z1a.dataEnt = item.Z1A_DATAEN;
            z1a.horaEnt = item.Z1A_HORAEN;
            z1a.horaSai = item.Z1A_HORASA;
            z1a.embalagem = item.Z1A_EMBAL;
            z1a.moega = item.Z1A_MOEGA;
            z1a.cicloD = item.Z1A_CICLOD;
            z1a.padrCi = item.Z1A_PADRCI;
            z1a.txPerf = item.Z1A_TXPERF;
            z1a.codJus = item.Z1A_CODJUS;
            return z1a;
        })

        const all = new Z1A_ALL();
        all.listTicket = ListaZ1A;
        all.labelMap = await getGridCollum("Z1AJUS", usuario);

        return all;
    } catch (error) {
        return new Retorno ({
            code: 500,
            message: `Erro interno (getZ1AJustif): ${error}`
        })
    }
}