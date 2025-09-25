import jwt from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';
require('dotenv').config();

export async function authToken(req: FastifyRequest, reply: FastifyReply) {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]

    if (!token) return reply.status(401).send({ message: 'Token não fornecido'})

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET as string)
        // @ts-ignore
        req.user = user
    } catch (err) {
        return reply.status(401).send({ message: 'Token inválido'})
    }
}

export async function authTokenProtheus(req: FastifyRequest, reply: FastifyReply) {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]

    if (!token) return reply.status(401).send({ message: 'Token não fornecido'})

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET as string)
        // @ts-ignore
        req.user = user
    } catch (err) {
        return reply.status(401).send({ message: 'Token inválido'})
    }
}