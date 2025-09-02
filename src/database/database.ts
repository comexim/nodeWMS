require("dotenv").config();

const sql = require("mssql");

const config = {
    server: process.env.SERVER,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: 'SQLEXPRESS'
    }
};

export default async function getConnection() {
    try {
        console.log("Tentando conectar com SQL Server...");
        const pool = await sql.connect(config);
        console.log("Conectado com sucesso!");
        return pool; 
    } catch(err: any) {
        console.error("Erro de conexão:", err.message);
        console.error("Código do erro:", err.code);
        throw err; 
    }
}
