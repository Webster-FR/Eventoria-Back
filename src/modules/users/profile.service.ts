import {Injectable} from "@nestjs/common";
import {PrismaService} from "../misc/prisma.service";
import {ImagesService} from "../images/images.service";

@Injectable()
export class ProfileService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly imagesService: ImagesService,
    ){}

    async updateAvatar(userId: number, avatarBuffer: Buffer){
        const currentProfile = await this.prismaService.userProfiles.findUnique({
            where: {
                user_id: userId,
            },
            include: {
                avatar: true,
            }
        });
        if(currentProfile.avatar)
            await this.imagesService.deleteImage(currentProfile.avatar.sum);
        const imageId = await this.imagesService.saveAvatar(avatarBuffer);
        await this.prismaService.userProfiles.update({
            where: {
                user_id: userId,
            },
            data: {
                avatar_id: imageId,
            }
        });
    }

    async changeDisplayName(userId: number, displayName: string){
        await this.prismaService.userProfiles.update({
            where: {
                user_id: userId,
            },
            data: {
                display_name: displayName,
            }
        });
    }

}
