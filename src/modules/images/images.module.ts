import {Module} from "@nestjs/common";
import {MiscModule} from "../misc/misc.module";
import {ImagesController} from "./images.controller";
import {ImagesService} from "./images.service";


@Module({
    imports: [MiscModule],
    controllers: [ImagesController],
    providers: [ImagesService],
})
export class ImagesModule{}
