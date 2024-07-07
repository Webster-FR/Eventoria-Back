import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {VersionController} from "./version.controller";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
    ],
    controllers: [VersionController],
    providers: [],
})
export class MiscModule{}
