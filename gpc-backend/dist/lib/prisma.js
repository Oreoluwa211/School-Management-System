"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma || new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL + "?pgbouncer=true&connection_limit=1"
        }
    }
});
if (env_1.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
