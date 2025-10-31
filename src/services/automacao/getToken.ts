import Retorno from "../../models/automacao/Retorno";
import Usuario from "../../models/automacao/Usuario";
import jwt from "jsonwebtoken"

export async function getToken(dados: any): Promise<Usuario | Retorno> {
    try {
        const USERS = [{ login: process.env.LOGIN, senha: process.env.SENHA}]
        const login = dados.login;
        const senha = dados.senha; 
        const user = USERS.find(u => u.login === login && u.senha === senha);
        if(!user) return new Retorno({ message: "Não autorizado!" });

        const token = jwt.sign({ username: user.login }, process.env.JWT_SECRET as string, {expiresIn: '360h'});

        return new Usuario({
            login: dados.login,
            senha: "",
            token: token
        });
    } catch (error) {
        console.log("Erro na autenticação:", error);
        return new Retorno({
            code: 500,
            type: "",
            message: ""
        });
    }
}