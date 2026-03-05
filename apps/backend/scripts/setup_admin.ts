/**
 * setup_admin.ts
 * 
 * Ensures an ADMIN user exists in the database.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL?.replace('localhost', '127.0.0.1');
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }) as any;

async function main() {
    console.log("Checking for admin user...");
    const adminEmail = "admin@3dex.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "adminpassword123";

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: "ADMIN", account_status: "APPROVED" },
        create: {
            email: adminEmail,
            username: "3dex_admin",
            password: adminPassword,
            role: "ADMIN",
            account_status: "APPROVED",
            display_name: "3Dex Administrator",
        },
    });

    console.log(`Admin user ${admin.username} is ready (ID: ${admin.id})`);
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
