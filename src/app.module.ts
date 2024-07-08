import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {MiscModule} from "./modules/misc/misc.module";
import {ImagesModule} from "./modules/images/images.module";
import {ThrottlerModule} from "@nestjs/throttler";
import {UsersModule} from "./modules/users/users.module";
import {MailerModule} from "@nestjs-modules/mailer";
import * as dotenv from "dotenv";
import {AuthModule} from "./modules/auth/auth.module";

dotenv.config();

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 50,
        }]),
        MailerModule.forRoot({
            transport: {
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT),
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                }
            },
        }),
        MiscModule,
        ImagesModule,
        UsersModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule{}
