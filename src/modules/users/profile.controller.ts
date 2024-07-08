import {
    BadRequestException, Body,
    Controller,
    HttpStatus,
    Patch, Put,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {ApiBody, ApiConsumes, ApiResponse, ApiTags} from "@nestjs/swagger";
import {ProfileService} from "./profile.service";
import {FileInterceptor} from "@nest-lab/fastify-multer";
import {AuthGuard} from "../auth/guards/auth.guard";
import {DisplayNameDto} from "./models/dto/display-name.dto";
import {BioDto} from "./models/dto/bio.dto";
import {SocialsDto} from "./models/dto/socials.dto";

@Controller("user/profile")
@ApiTags("Profile")
export class ProfileController{
    constructor(
        private readonly profileService: ProfileService,
    ){}

    @Patch("avatar")
    @UseGuards(AuthGuard)
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("file", {
        limits: {
            fileSize: 50 * 1024 * 1024
        },
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|avif)$/)){
                return callback(new BadRequestException("Only images can be uploaded"), false);
            }
            callback(null, true);
        },
    }))
    @ApiBody({
        required: true,
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                    description: "Image file (jpg, jpeg, png, gif, webp, avif) with a maximum size of 50MB",
                }
            }
        }
    })
    @ApiResponse({status: HttpStatus.OK, description: "Avatar updated"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Only images can be uploaded"})
    async updateAvatar(
        @Req() req: any,
        @UploadedFile() file: any
    ){
        await this.profileService.updateAvatar(req.user.id, file.buffer);
    }

    @Patch("display-name")
    @UseGuards(AuthGuard)
    @ApiResponse({status: HttpStatus.OK, description: "Display name updated"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Display name is invalid"})
    async changeDisplayName(
        @Req() req: any,
        @Body() body: DisplayNameDto
    ){
        await this.profileService.changeDisplayName(req.user.id, body.displayName);
    }

    @Patch("bio")
    @UseGuards(AuthGuard)
    @ApiResponse({status: HttpStatus.OK, description: "Bio updated"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Bio is invalid"})
    async changeBio(
        @Req() req: any,
        @Body() body: BioDto
    ){
        await this.profileService.changeBio(req.user.id, body.bio);
    }

    @Put("socials")
    @UseGuards(AuthGuard)
    @ApiResponse({status: HttpStatus.OK, description: "Socials updated"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Socials are invalid"})
    async updateSocials(
        @Req() req: any,
        @Body() body: SocialsDto
    ){
        await this.profileService.updateSocials(req.user.id, body);
    }

}
