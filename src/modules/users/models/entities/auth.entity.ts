import {ApiProperty} from "@nestjs/swagger";
import {UserEntity} from "./user.entity";

export class AuthEntity{
    @ApiProperty()
        user: UserEntity;
    @ApiProperty()
        token: string;
}
