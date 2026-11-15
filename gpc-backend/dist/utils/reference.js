"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReferenceNumber = generateReferenceNumber;
const prisma_1 = require("../lib/prisma");
async function generateReferenceNumber() {
    const year = new Date().getFullYear();
    let reference;
    let exists = true;
    do {
        const random = Math.floor(10000 + Math.random() * 90000);
        reference = `GPC-${year}-${random}`;
        const existing = await prisma_1.prisma.admission.findUnique({ where: { reference_number: reference } });
        exists = !!existing;
    } while (exists);
    return reference;
}
