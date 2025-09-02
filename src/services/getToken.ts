import Retorno from "../models/Retorno";
import Usuario from "../models/Usuario";
import jwt from "jsonwebtoken"

export async function getToken(dados: any): Promise<Usuario | Retorno> {
    try {
            const USERS = [{ username: process.env.LOGIN, password: process.env.SENHA}]
            const login = dados.username;
            const senha = dados.password; 

            const user = USERS.find(u => u.username === login && u.password === senha);
            if(!user) return new Retorno({ message: "Não autorizado!" });

            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET as string, {expiresIn: '360h'});

            return new Usuario({
                login: dados.username,
                senha: "",
                token: token
            });
    } catch (error) {
            return new Retorno({
                code: 500,
                type: "",
                message: ""
            });
    }
}