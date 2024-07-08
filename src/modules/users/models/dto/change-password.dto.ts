import {ApiProperty} from "@nestjs/swagger";
import {IsBoolean, IsNotEmpty, IsString, Matches} from "class-validator";

export class ChangePasswordDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_&é"'(§è!çà)\-°?,.;*/:+=\\^¨$`£ù%µπÉÈÀÇâêôûòãñõ@#]).{8,}$/)
        password: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
        logout: boolean;
}
