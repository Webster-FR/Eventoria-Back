import {ApiProperty} from "@nestjs/swagger";

export class PublicSessionEntity{
    @ApiProperty()
        id: string;
    @ApiProperty()
        browserName: string;
    @ApiProperty()
        browserVersion: string;
    @ApiProperty()
        os: string;
    @ApiProperty()
        device: string;
    @ApiProperty()
        expiresAt: Date;
}
