import {Injectable} from "@nestjs/common";
import {PrismaService} from "../misc/prisma.service";
import * as fs from "node:fs";
import {CipherService} from "../misc/cipher.service";
import sharp from "sharp";


@Injectable()
export class ImagesService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    async saveAvatar(image: Buffer): Promise<string>{
        const newImage = await this.convertImage(await this.resizeImage(image, 256, 256));
        return await this.saveImage(newImage);
    }

    private async saveImage(image: Buffer): Promise<string>{
        const sum = this.cipherService.getSum(image);
        const dbImage = await this.prismaService.images.findUnique({
            where: {
                sum: sum,
            },
        });
        if(dbImage)
            return sum;
        const path = `./images/${sum.substring(0, 2)}`;
        if(!fs.existsSync(path))
            fs.mkdirSync(path, {
                recursive: true,
            });
        fs.writeFileSync(`./images/${sum.substring(0, 2)}/${sum}.webp`, image);
        await this.prismaService.images.create({
            data: {
                sum: sum,
            },
        });
        return sum;
    }

    async loadImage(sum: string): Promise<Buffer | null>{
        const path = `./images/${sum.substring(0, 2)}/${sum}.webp`;
        if(!fs.existsSync(path))
            return null;
        return fs.readFileSync(path);
    }

    async deleteImage(sum: string){
        const path = `./images/${sum.substring(0, 2)}/${sum}.webp`;
        const dbImage = await this.prismaService.images.findUnique({
            where: {
                sum: sum,
            },
            include: {
                user_profiles: true,
            }
        });
        // Be sure that the image is removed on the disk
        if(!dbImage){
            fs.rmSync(path);
            return;
        }
        // Prevent deletion if image is still used
        const usages = dbImage.user_profiles.length;
        if(usages > 1)
            return;
        // Remove image from disk and database
        await this.prismaService.images.delete({
            where: {
                sum: sum,
            },
        });
        fs.rmSync(path);
    }

    private async convertImage(image: Buffer): Promise<Buffer>{
        return await sharp(image).webp({
            preset: "picture",
            effort: 6,
            smartSubsample: false,
            quality: 80,
            nearLossless: false,
            lossless: false,
            alphaQuality: 100,
        }).toBuffer();
    }

    private async resizeImage(image: Buffer, width: number, height: number): Promise<Buffer>{
        return await sharp(image).resize(width, height).toBuffer();
    }
}
