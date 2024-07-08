import {IsNotEmpty, IsString, Length, Matches} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ResetPasswordDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(36, 36)
        otp: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_&é"'(§è!çà)\-°?,.;*/:+=\\^¨$`£ù%µπÉÈÀÇâêôûòãñõ@#]).{8,}$/)
        password: string;
}
