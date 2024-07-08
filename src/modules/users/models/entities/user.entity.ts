import {UserProfileEntity} from "./user-profile.entity";
import {ApiProperty} from "@nestjs/swagger";

export class UserEntity{
    @ApiProperty()
        id: number;
    @ApiProperty()
        username: string;
    @ApiProperty()
        email: string;
    @ApiProperty()
        admin: boolean;
    @ApiProperty()
        verified: boolean;
    @ApiProperty()
        createdAt: Date;
    @ApiProperty()
        updatedAt: Date;
    @ApiProperty()
        profile: UserProfileEntity;
}
