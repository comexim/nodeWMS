import Usuario from "../../models/protheus/Usuario";
import MsgRetorno from "../../models/protheus/MsgRetorno";
import { executeQueryNet } from "../../utils/dbExecute";
import jwt from "jsonwebtoken";

export async function getTokenProtheus (dados: any): Promise<MsgRetorno> {
    try {
        const sql = `SELECT U.UserLogin, UserNome, UserMail, DirRotina
                        FROM Cmx_User U, Cmx_User_Dir D
                            WHERE
                                U.UserLogin=D.UserLogin 
                                    AND U.UserLogin = @UserLogin
                                        AND UserStatus = 'AT'`;

        const params = {
            UserLogin: dados.telefone
        }

        const result = await executeQueryNet(sql, params);
        console.log("Resposta:",result);
        const direitos: string[] = [];
        let nome = "", telefone = "", mail = "";

        if (result.recordset.length > 0) {
            const token = jwt.sign({ telefone: dados.telefone }, process.env.JWT_SECRET as string, {expiresIn: '360h'});

            result.recordset.forEach((row: any) => {
                direitos.push(row.DirRotina.trim());
                nome = row.UserNome.trim();
                telefone = row.UserLogin.trim();
                mail = row.UserMail.trim();
            });

            const usuario = new Usuario ({
                nome,
                telefone,
                direitos,
                mail,
                token
            });

            return new MsgRetorno ({
                codRet: "201",
                data: usuario,
                descrRet: "Usuário autorizado"
            });
        } else {
            return new MsgRetorno ({
                codRet: "403",
                data: "",
                descrRet: "Usuário não autorizado"
            });
        }        
    } catch (error) {
        return new MsgRetorno ({
            codRet: "500",
            data: "",
            descrRet: "Erro interno"
        })
    }
}