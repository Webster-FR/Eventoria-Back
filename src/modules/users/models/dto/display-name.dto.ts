import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, Matches} from "class-validator";

export class DisplayNameDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Matches(/^[\w.\- ïîôöõñêëéèàäâãçÉÈÀÇÙùÏÎÕÑÔÖ]{2,32}$/)
        displayName: string;
}
