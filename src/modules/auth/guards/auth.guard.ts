import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {AuthService} from "../auth.service";
import {UsersService} from "../../users/users.service";

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest();
        const sessionUUID = request.cookies.session;
        if(!sessionUUID)
            throw new UnauthorizedException("No session provided");
        const userAgent = request.headers["user-agent"];
        const userId = await this.authService.verifySession(sessionUUID, userAgent);
        request.user = await this.usersService.getUserById(userId);
        return true;
    }
}
