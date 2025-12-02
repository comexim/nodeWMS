import { executeQueryLocal } from "../../utils/dbExecute";

export async function getMotorista (login: string, senha: string) {
    try {
        // Validação dos parâmetros de entrada
        if (!login || !senha) {
            console.warn('[getMotorista] Login ou senha não fornecidos');
            return {
                code: 400,
                type: "Error",
                message: "Login e senha são obrigatórios!",
                data: "false",
                direitos: null,
                recno: null,
                retorno: null
            };
        }

        const sql = `SELECT MotCod, MotAdm, MotDelEtq, MotDirOS, MotDirOsMoe, 
                            MotDirImas, MotDirSilo, MotDirRem
                        FROM WMS_Motorista
                            WHERE UPPER(MotCod) = @login
                        AND MotSenha = @senha
                     AND MotStatus = 'AT'`;

        login = login.toUpperCase();
        console.log('[getMotorista] Logado:', {login});

        const result = await executeQueryLocal(sql, {login, senha});

        if (result && result.recordset && result.recordset.length > 0) {
            const motorista = result.recordset[0];
            
            const direitos = {
                MotAdm: motorista.MotAdm || 'N',
                MotDelEtq: motorista.MotDelEtq || 'N',
                MotDirOS: motorista.MotDirOS || 'N',
                MotDirOsMoe: motorista.MotDirOsMoe || 'N',
                MotDirImas: motorista.MotDirImas || 'N',
                MotDirSilo: motorista.MotDirSilo || 'N',
                MotDirRem: motorista.MotDirRem || 'N'
            };
            console.log('[getMotorista] Permissões:', direitos);

            return {
                code: 600,
                type: "Success",
                message: "Usuário autenticado com sucesso!",
                data: "true",
                direitos: direitos,
                recno: null,
                retorno: null
            };
        } else {
            console.warn('[getMotorista] Usuário ou senha inválidos!');
            return {
                code: 400,
                type: "Error",
                message: "Usuário ou senha inválidos!",
                data: "false",
                direitos: null,
                recno: null,
                retorno: null
            };
        }
        
    } catch (error) {
        console.error('[getMotorista] Erro ao autenticar usuário:', error);
        return {
            code: 500,
            type: "Error",
            message: `Erro ao autenticar usuário: ${error}`,
            data: "false",
            direitos: null,
            recno: null,
            retorno: null
        };
    }
}