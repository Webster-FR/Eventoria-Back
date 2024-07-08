import {Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {UsersService} from "./users.service";
import {CreateUserDto} from "./models/dto/create-user.dto";
import {UserEntity} from "./models/entities/user.entity";
import {FastifyReply} from "fastify";
import {AuthService} from "../auth/auth.service";
import {ConfigService} from "@nestjs/config";
import {AuthGuard} from "../auth/guards/auth.guard";

@Controller("users")
@ApiTags("Users")
export class UsersController{
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ){}

    @Post("register")
    @ApiResponse({status: HttpStatus.CREATED, description: "User created", type: UserEntity})
    @ApiResponse({status: HttpStatus.FORBIDDEN, description: "Banned email"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Some fields are wrong"})
    @ApiResponse({status: HttpStatus.CONFLICT, description: "Username or email already used"})
    async registerUser(@Body() body: CreateUserDto, @Req() req: any, @Res({passthrough: true}) res: FastifyReply){
        const user = await this.usersService.createUser(body.username, body.email, body.password, body.displayName);
        const userAgent = req.headers["user-agent"];
        const sessionUUID = await this.authService.createSessionByUserId(user.id, userAgent);
        res.setCookie("session", sessionUUID, {
            httpOnly: true,
            sameSite: "strict",
            secure: this.configService.get("SECURE_COOKIE") === "true",
            path: "/" + this.configService.get("PREFIX"),
        });
    }

    @Get("me")
    @UseGuards(AuthGuard)
    async getMe(@Req() req: any): Promise<UserEntity>{
        return req.user;
    }

}
