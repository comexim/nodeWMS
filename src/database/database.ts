require("dotenv").config();

const sql = require("mssql");

const configLocal = {
    server: process.env.SERVERLOCAL,
    database: process.env.DATABASELOCAL,
    user: process.env.USERLOCAL,
    password: process.env.PASSWORDLOCAL,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: 'SQLEXPRESS'
    }
};

const configNet = {
    server: process.env.SERVERNET,
    database: process.env.DATABASENET,
    user: process.env.USERNET,
    password: process.env.PASSWORDNET,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

let poolLocal:any=null
let poolNet:any=null

export async function getConnectionLocal() {
    try {
        if (!poolLocal) {
            console.log("Criando pool Local...");
            poolLocal = new sql.ConnectionPool(configLocal);
            await poolLocal.connect();
            console.log("Pool Local conectado!");
        }
        return poolLocal;
    } catch(err: any) {
        console.error("Erro conexão Local:", err.message);
        throw err;
    }
}

export async function getConnectionNet() {
    try {
        if (!poolNet) {
            console.log("Criando pool Net...");
            poolNet = new sql.ConnectionPool(configNet);
            await poolNet.connect();
            console.log("Pool Net conectado!");
        }
        return poolNet;
    } catch(err: any) {
        console.error("Erro conexão Net:", err.message);
        throw err; 
    }
}

// Função para fechar pools quando necessário
export async function closeConnections() {
    if (poolLocal) await poolLocal.close();
    if (poolNet) await poolNet.close();
}
