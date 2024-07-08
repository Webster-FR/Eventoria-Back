import {
    Body,
    ConflictException,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {UsersService} from "./users.service";
import {CreateUserDto} from "./models/dto/create-user.dto";
import {UserEntity} from "./models/entities/user.entity";
import {FastifyReply} from "fastify";
import {AuthService} from "../auth/auth.service";
import {ConfigService} from "@nestjs/config";
import {AuthGuard} from "../auth/guards/auth.guard";
import {OtpDto} from "./models/dto/otp.dto";
import {UsernameParamDto} from "./models/dto/username-param.dto";
import {ChangePasswordDto} from "./models/dto/change-password.dto";
import {EmailBodyDto} from "./models/dto/email-body.dto";
import {ResetPasswordDto} from "./models/dto/reset-password.dto";
import {OpenDisputeDto} from "./models/dto/open-dispute.dto";
import {EmailDisputeEntity} from "./models/entities/email-dispute.entity";

@Controller("users")
@ApiTags("Users")
export class UsersController{
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ){}

    @Get("username/availability/:username")
    @ApiResponse({status: HttpStatus.OK, description: "Username available"})
    @ApiResponse({status: HttpStatus.CONFLICT, description: "Username already used"})
    async checkUsernameAvailability(
        @Param() params: UsernameParamDto
    ){
        if(!await this.usersService.isUsernameAvailable(params.username))
            throw new ConflictException("Username already used");
    }

    @Post("register")
    @ApiResponse({status: HttpStatus.CREATED, description: "User created", type: UserEntity})
    @ApiResponse({status: HttpStatus.FORBIDDEN, description: "Banned email"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Some fields are wrong"})
    @ApiResponse({status: HttpStatus.CONFLICT, description: "Username or email already used"})
    async registerUser(
        @Req() req: any,
        @Res({passthrough: true}) res: FastifyReply,
        @Body() body: CreateUserDto
    ){
        const user = await this.usersService.createUser(body.username, body.email, body.password, body.displayName);
        const userAgent = req.headers["user-agent"];
        const sessionUUID = await this.authService.createSessionByUserId(user.id, userAgent, false);
        res.setCookie("session", sessionUUID, {
            httpOnly: true,
            sameSite: "strict",
            secure: this.configService.get("SECURE_COOKIE") === "true",
            path: "/" + this.configService.get("PREFIX"),
        });
        res.send(user);
    }

    @Get("me")
    @UseGuards(AuthGuard)
    @ApiResponse({status: HttpStatus.OK, description: "User found", type: UserEntity})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    async getMe(@Req() req: any): Promise<UserEntity>{
        return req.user;
    }

    @Post("email/confirm")
    @UseGuards(AuthGuard)
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: "Email confirmed"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Invalid otp"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    async confirmEmail(@Req() req: any, @Body() body: OtpDto){
        await this.usersService.confirmEmail(req.user.id, body.otp);
    }

    @Post("email/confirm/resend")
    @UseGuards(AuthGuard)
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: "Email confirmation resent"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    async resendEmailConfirmation(@Req() req: any){
        await this.usersService.resendEmailConfirmation(req.user.id);
    }

    @Patch("password")
    @UseGuards(AuthGuard)
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: "Password changed"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    async changePassword(@Req() req: any, @Res() res: FastifyReply, @Body() body: ChangePasswordDto){
        await this.usersService.changePassword(req.user.id, body.password);
        if(body.logout){
            await this.authService.invalidateUserSessions(req.user.id);
            res.clearCookie("session");
        }
    }

    @Post("password/reset/request")
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: "Password reset requested"})
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: "User not found"})
    async requestPasswordReset(@Body() body: EmailBodyDto){
        await this.usersService.requestPasswordReset(body.email);
    }

    @Post("password/reset")
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: "Password reset"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Invalid otp"})
    async resetPassword(@Body() body: ResetPasswordDto){
        await this.usersService.resetPassword(body.otp, body.password);
    }

    @Post("email/migrate")
    @UseGuards(AuthGuard)
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: "Email migrated"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    async migrateEmail(@Req() req: any, @Res() res: FastifyReply, @Body() body: EmailBodyDto){
        await this.usersService.migrateEmail(req.user.id, body.email);
        await this.authService.invalidateUserSessions(req.user.id);
        res.clearCookie("session");
    }

    @Post("email/migrate/dispute")
    @ApiResponse({status: HttpStatus.OK, description: "Email migration dispute sent", type: EmailDisputeEntity})
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: "Email change not found"})
    @ApiResponse({status: HttpStatus.CONFLICT, description: "Email change already disputed"})
    async openEmailDispute(@Body() body: OpenDisputeDto): Promise<EmailDisputeEntity>{
        return await this.usersService.openEmailDispute(body.otp, body.context);
    }

    @Get(":username")
    @ApiResponse({status: HttpStatus.OK, description: "User found", type: UserEntity})
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: "User not found"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Invalid username"})
    async getUserByUsername(@Param() params: UsernameParamDto): Promise<UserEntity>{
        return await this.usersService.getUserByUsername(params.username);
    }
}
