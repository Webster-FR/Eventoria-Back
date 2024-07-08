import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {VersionController} from "./version.controller";
import {CipherService} from "./cipher.service";
import {PrismaService} from "./prisma.service";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
    ],
    controllers: [VersionController],
    providers: [CipherService, PrismaService],
    exports: [CipherService, PrismaService],
})
export class MiscModule{}
