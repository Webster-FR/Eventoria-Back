import {ApiProperty} from "@nestjs/swagger";

export class UserProfileEntity{
    @ApiProperty()
        displayName: string;
    @ApiProperty()
        bio?: string;
    @ApiProperty()
        avatarSum?: string;
    @ApiProperty()
        instagram?: string;
    @ApiProperty()
        facebook?: string;
    @ApiProperty()
        twitter?: string;
}
