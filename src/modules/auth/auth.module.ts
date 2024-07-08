import {forwardRef, Module} from "@nestjs/common";
import {MiscModule} from "../misc/misc.module";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {AuthGuard} from "./guards/auth.guard";
import {UsersModule} from "../users/users.module";

@Module({
    imports: [MiscModule, forwardRef(() => UsersModule)],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard],
    exports: [AuthService, AuthGuard]
})
export class AuthModule{}
