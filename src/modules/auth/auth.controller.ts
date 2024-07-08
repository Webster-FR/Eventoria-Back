import {Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthService} from "./auth.service";
import {FastifyReply, FastifyRequest} from "fastify";
import {LoginDto} from "./models/dto/login.dto";
import {ConfigService} from "@nestjs/config";
import {AuthGuard} from "./guards/auth.guard";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController{
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ){}

    @Post("login")
    async login(@Body() body: LoginDto, @Req() req: FastifyRequest, @Res({passthrough: true}) res: FastifyReply){
        const userAgent = req.headers["user-agent"];
        const sessionUUID = await this.authService.createSession(body.email, body.password, userAgent, body.remember);
        res.setCookie("session", sessionUUID, {
            httpOnly: true,
            sameSite: "lax",
            secure: this.configService.get("SECURE_COOKIE") === "true",
            path: "/",
        });
    }

    @Post("logout")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: "Logout successful"})
    async logout(@Req() request: any, @Res({passthrough: true}) res: FastifyReply){
        const sessionUUID = request.cookies.session;
        await this.authService.invalidateSession(request.user.id, sessionUUID);
        res.clearCookie("session", {
            httpOnly: true,
            sameSite: "lax",
            secure: this.configService.get("SECURE_COOKIE") === "true",
            path: "/",
        });
    }

    @Post("logout/all")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: "Logout successful"})
    async logoutAll(@Req() request: any, @Res({passthrough: true}) res: FastifyReply){
        await this.authService.invalidateUserSessions(request.user.id);
        res.clearCookie("session", {
            httpOnly: true,
            sameSite: "strict",
            secure: this.configService.get("SECURE_COOKIE") === "true",
            path: "/" + this.configService.get("PREFIX"),
        });
    }

}
