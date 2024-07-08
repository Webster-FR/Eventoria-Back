import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, Matches} from "class-validator";

export class UsernameParamDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])[a-z._\d]{5,24}$/)
        username: string;
}
