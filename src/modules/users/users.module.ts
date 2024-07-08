import {Module} from "@nestjs/common";
import {MiscModule} from "../misc/misc.module";
import {UsersService} from "./users.service";
import {UsersController} from "./users.controller";
import {AuthModule} from "../auth/auth.module";

@Module({
    imports: [MiscModule, AuthModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule{}
