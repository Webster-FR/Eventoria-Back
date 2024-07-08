import {ApiProperty} from "@nestjs/swagger";

export class EmailDisputeEntity{
    @ApiProperty()
        uuid: string;
    @ApiProperty()
        emailChangeUuid: string;
    @ApiProperty()
        context: string;
    @ApiProperty()
        resolvedAt: Date;
    @ApiProperty()
        createdAt: Date;
}
