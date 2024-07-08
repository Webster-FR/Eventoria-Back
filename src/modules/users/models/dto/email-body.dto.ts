import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, IsString} from "class-validator";

export class EmailBodyDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsEmail()
        email: string;
}
