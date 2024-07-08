import {PrismaClient} from "@prisma/client";
import * as dotenv from "dotenv";
import usersFunction from "./seeds/users.seed";
import userProfilesFunction from "./seeds/user-profiles.seed";

dotenv.config();

// initialize Prisma Client
const prisma = new PrismaClient();

async function main(){
    const gStart = Date.now();

    let start = Date.now();
    const users = await usersFunction();
    await seed(prisma.users, users, false);
    console.log("✅  User seed done ! (" + (Date.now() - start) + "ms)");

    start = Date.now();
    const userProfiles = await userProfilesFunction();
    await seed(prisma.userProfiles, userProfiles, true, "user_id");
    console.log("✅  User seed done ! (" + (Date.now() - start) + "ms)");

    console.log(`\n✅  Seeding completed ! (${Date.now() - gStart}ms)`);
}

async function seed(table: any, data: any[], update: boolean = true, idName: string = "id"){
    for(let i = 1; i <= data.length; i++){
        if(update)
            await table.upsert({
                where: {[idName]: i},
                update: {
                    ...data[i - 1],
                },
                create: {
                    ...data[i - 1],
                },
            });
        else
            await table.upsert({
                where: {[idName]: i},
                update: {},
                create: {
                    ...data[i - 1],
                },
            });
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async() => {
    await prisma.$disconnect();
});
