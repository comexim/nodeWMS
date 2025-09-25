import MsgRetorno from "../../models/protheus/MsgRetorno";

export function getTokenProtheusValidation (dados: any): MsgRetorno | null {
    if(!dados.telefone) return new MsgRetorno ({ codRet: "500", descrRet: "Usuário necessário!" });
    //if(!dados.senha) return new MsgRetorno ({ codRet: "500", descrRet: "Senha necessária!" });
    return null;
}