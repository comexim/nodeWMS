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
        console.log("Tentando conectar com SQL Server...");
        poolLocal = await sql.connect(configLocal);
        console.log("Conectado com sucesso!");
        return poolLocal; 
    } catch(err: any) {
        console.error("Erro de conexão:", err.message);
        console.error("Código do erro:", err.code);
        throw err; 
    }
}

export async function getConnectionNet() {
    try {
        console.log("Tentando conectar com SQL Server...");
        poolNet = await sql.connect(configNet);
        console.log("Conectado com sucesso!");
        return poolNet; 
    } catch(err: any) {
        console.error("Erro de conexão:", err.message);
        console.error("Código do erro:", err.code);
        throw err; 
    }
}
