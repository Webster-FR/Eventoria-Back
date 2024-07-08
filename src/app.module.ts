import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {MiscModule} from "./modules/misc/misc.module";
import {ImagesModule} from "./modules/images/images.module";
import {ThrottlerModule} from "@nestjs/throttler";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 50,
        }]),
        MiscModule,
        ImagesModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule{}
