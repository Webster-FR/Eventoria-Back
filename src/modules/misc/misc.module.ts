import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {VersionController} from "./version.controller";
import {CipherService} from "./cipher.service";
import {PrismaService} from "./prisma.service";
import {EmailService} from "./email.service";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
    ],
    controllers: [VersionController],
    providers: [CipherService, PrismaService, EmailService],
    exports: [CipherService, PrismaService, EmailService],
})
export class MiscModule{}
