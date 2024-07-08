import {IsEmail, IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class LoginDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsEmail()
        email: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
        password: string;
}
