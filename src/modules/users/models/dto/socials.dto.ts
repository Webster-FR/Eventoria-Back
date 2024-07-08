import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString} from "class-validator";

export class SocialsDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
        instagram: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
        facebook: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
        twitter: string;
}
