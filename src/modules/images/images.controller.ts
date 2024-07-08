import {BadRequestException, Controller, Get, HttpStatus, NotFoundException, Param, Res} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {ImageSumDto} from "./models/dto/image-sum.dto";
import {ImagesService} from "./images.service";
import {FastifyReply} from "fastify";

@Controller("images")
@ApiTags("Images")
export class ImagesController{

    constructor(
        private readonly imagesService: ImagesService,
    ){}

    @Get(":sum")
    @ApiResponse({status: HttpStatus.OK, description: "Get image"})
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: "Not found"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Invalid sha256 sum"})
    async getImage(@Param() imageSumDto: ImageSumDto, @Res() res: FastifyReply){
        const regex: RegExp = new RegExp("^[a-f0-9]{64}$");
        if(!regex.test(imageSumDto.sum))
            throw new BadRequestException("Invalid sha256 sum");
        const image = await this.imagesService.loadImage(imageSumDto.sum);
        if(!image)
            throw new NotFoundException("Image not found");
        res.header("Content-Type", "image/webp");
        res.header("Cache-Control", "public, max-age=2592000");
        res.send(image);
    }
}
