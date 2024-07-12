import {Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthService} from "./auth.service";
import {FastifyReply, FastifyRequest} from "fastify";
import {LoginDto} from "./models/dto/login.dto";
import {ConfigService} from "@nestjs/config";
import {AuthGuard} from "./guards/auth.guard";
import {UsersService} from "../users/users.service";
import {UserEntity} from "../users/models/entities/user.entity";
import {PublicSessionEntity} from "../users/models/entities/public-session.entity";
import {AuthEntity} from "../users/models/entities/auth.entity";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController{
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ){}

    @Post("login")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.OK, description: "Login successful", type: AuthEntity})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Invalid credentials"})
    async login(@Body() body: LoginDto, @Req() req: FastifyRequest){
        const userAgent = req.headers["user-agent"];
        const {sessionUuid, userId} = await this.authService.createSession(body.email, body.password, userAgent, body.remember);
        const user = await this.usersService.getUserById(userId);
        return {
            user,
            token: sessionUuid,
        } as AuthEntity;
    }

    @Post("logout")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: "Logout successful"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    async logout(@Req() request: any, @Res({passthrough: true}) res: FastifyReply){
        const sessionUUID = request.cookies.session;
        await this.authService.invalidateSession(request.user.id, sessionUUID);
    }

    @Post("logout/all")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: "Logout successful"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    async logoutAll(@Req() request: any){
        await this.authService.invalidateUserSessions(request.user.id);
    }

    @Get("sessions")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({status: HttpStatus.OK, description: "Get all sessions", type: [PublicSessionEntity]})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    async getSessions(@Req() request: any){
        return this.authService.getSessions(request.user.id);
    }

}
