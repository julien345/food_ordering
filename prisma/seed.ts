// prisma/seed.ts
import prisma from "../src/config/prisma";
import bcrypt from "bcrypt";

const TEST_PASSWORD = "password123";

async function upsertTestUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  role: "CLIENT" | "ADMIN" | "DELIVERY_AGENT";
}) {
  const existing = await prisma.user.findFirst({ where: { email: data.email } });
  if (existing) {
    console.log(`Déjà existant, ignoré : ${data.email}`);
    return existing;
  }

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      cart: { create: {} },
    },
  });

  console.log(`Créé : ${user.email} (${user.role})`);
  return user;
}

async function main() {
  console.log("Démarrage du seed...\n");

  await upsertTestUser({
    email: "admin@test.com",
    firstName: "rayan",
    lastName: "blommer",
    role: "ADMIN",
  });

  await upsertTestUser({
    email: "livreur3@test.com",
    firstName: "Paul",
    lastName: "jardin",
    role: "DELIVERY_AGENT",
  });

  await upsertTestUser({
    email: "livreur4@test.com",
    firstName: "Marc",
    lastName: "Ebelle",
    role: "DELIVERY_AGENT",
  });

  await upsertTestUser({
    email: "yannick@test.com",
    firstName: "yannick",
    lastName: "dumont",
    role: "CLIENT"
  });

  await upsertTestUser({
    email: "sophie@test.com",
    firstName: "Sophie",
    lastName: "larousse",
    role: "CLIENT",
  });

  console.log(`\nSeed terminé. Mot de passe commun : "${TEST_PASSWORD}"`);
}

main()
  .catch((e) => {
    console.error("Erreur pendant le seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });