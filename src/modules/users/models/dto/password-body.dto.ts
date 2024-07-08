import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, Matches} from "class-validator";

export class PasswordBodyDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_&é"'(§è!çà)\-°?,.;*/:+=\\^¨$`£ù%µπÉÈÀÇâêôûòãñõ@#]).{8,}$/)
        password: string;
}
