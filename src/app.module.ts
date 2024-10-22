import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {MiscModule} from "./modules/misc/misc.module";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        MiscModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule{}
