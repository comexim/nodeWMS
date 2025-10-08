import fastify from "fastify";
import { routes } from "./routes";
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { swaggerConfig } from "./config/swaggerConfig";
import path from "path";

dotenv.config();

export const app = fastify({
    ajv: {
        customOptions: {
            strict: false,
            removeAdditional: false,
            useDefaults: true,
            coerceTypes: true,
            allErrors: true
        }
    }
});

app.register(cors, {
    origin: true,
    allowedHeaders: ['Authorization', 'Content-Type']
});

app.register(require('@fastify/static'), {
    root: path.join(__dirname, '..', 'public'),
    prefix: '/'
})

// Registrar Swagger antes das rotas
app.register(require('@fastify/swagger'), swaggerConfig);

app.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: swaggerConfig.uiConfig
});

// Registrar rotas depois do Swagger
app.register(routes);

// Definir porta baseada no DATABASELOCAL
const port = process.env.DATABASELOCAL === 'Teste' ? 3090 : 3000;

// @ts-ignore
app.listen({ port: port, host: process.env.HOST }, (err, address) => {
    if(err) {
        console.log(err);
        process.exit(1);
    }

    const isTest = process.env.DATABASELOCAL === 'teste';
    const ambiente = isTest ? 'TESTE' : 'AUTOMAÇÃO';

    console.log(`Server rodando em ${address}`);
    console.log(`Ambiente: ${ambiente} (Database: ${process.env.DATABASELOCAL})`);
    console.log(`Swagger UI disponível em ${address}/docs`);
});