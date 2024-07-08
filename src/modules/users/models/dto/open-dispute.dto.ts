import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, Length} from "class-validator";

export class OpenDisputeDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(36, 36)
        otp: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
        context: string;
}
