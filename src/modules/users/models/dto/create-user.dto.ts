import {IsEmail, IsNotEmpty, IsString, Matches} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])[a-z._]{8,24}$/)
        username: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsEmail()
        email: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_&é"'(§è!çà)\-°?,.;/:+=\\^¨$`£ù%µπÉÈÀÇâêôûòãñõ@#]).{8,}$/)
        password: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Matches(/^[\w.\- ïîôöõñêëéèàäâãçÉÈÀÇÙùÏÎÕÑÔÖ]{2,32}$/)
        displayName: string;
}
