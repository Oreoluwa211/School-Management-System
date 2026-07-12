import { prisma } from "../lib/prisma";

export async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  let reference: string;
  let exists = true;

  do {
    const random = Math.floor(10000 + Math.random() * 90000);
    reference = `GPC-${year}-${random}`;
    const existing = await prisma.admission.findUnique({ where: { reference_number: reference } });
    exists = !!existing;
  } while (exists);

  return reference;
}