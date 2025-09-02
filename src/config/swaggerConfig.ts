import dotenv from 'dotenv';

dotenv.config();

export const swaggerConfig = {
    swagger: {
        info: {
            title: 'NodeAPI - Sistema WMS',
            description: 'API para gerenciamento do sistema WMS - Comexim',
            version: '1.0.0',
            contact: {
                name: 'Tal',
                email: 'OutroTal'
            }
        },
        //host: `${process.env.HOST}:${process.env.PORT}`,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        securityDefinitions: {
            Bearer: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
                description: 'Digite "Bearer" seguido do token JWT'
            }
        },
        security: [
            {
                Bearer: []
            }
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'Endpoints de autenticação'
            },
            {
                name: 'Z71',
                description: 'Operações relacionadas ao Z71'
            },
            {
                name: 'OP',
                description: 'Operações de Produção'
            },
            {
                name: 'Bags',
                description: 'Gerenciamento de Bags'
            },
            {
                name: 'Endereçamento',
                description: 'Movimentação de endereços'
            }
        ]
    },
    uiConfig: {
        customfavIcon: '/fastify.ico',
        customSiteTitle: 'NodeAPI - Sistema WMS'
    }
}