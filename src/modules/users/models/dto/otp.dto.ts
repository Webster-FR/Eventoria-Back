import {ApiProperty} from "@nestjs/swagger";
import {IsString, Length} from "class-validator";

export class OtpDto{
    @ApiProperty()
    @IsString()
    @Length(6, 6)
        otp: string;
}
