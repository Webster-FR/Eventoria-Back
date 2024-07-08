import {Module} from "@nestjs/common";
import {MiscModule} from "../misc/misc.module";
import {UsersService} from "./users.service";
import {UsersController} from "./users.controller";
import {AuthModule} from "../auth/auth.module";
import {ProfileService} from "./profile.service";
import {ProfileController} from "./profile.controller";
import {ImagesModule} from "../images/images.module";

@Module({
    imports: [MiscModule, AuthModule, ImagesModule],
    controllers: [UsersController, ProfileController],
    providers: [UsersService, ProfileService],
    exports: [UsersService],
})
export class UsersModule{}
