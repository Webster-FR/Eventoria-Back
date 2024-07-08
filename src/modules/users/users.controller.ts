import {Body, Controller, HttpStatus, Post} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {UsersService} from "./users.service";
import {CreateUserDto} from "./models/dto/create-user.dto";
import {UserEntity} from "./models/entities/user.entity";

@Controller("users")
@ApiTags("Users")
export class UsersController{
    constructor(
        private readonly usersService: UsersService,
    ){}

    @Post("register")
    @ApiResponse({status: HttpStatus.CREATED, description: "User created", type: UserEntity})
    @ApiResponse({status: HttpStatus.FORBIDDEN, description: "Banned email"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Some fields are wrong"})
    @ApiResponse({status: HttpStatus.CONFLICT, description: "Username or email already used"})
    async registerUser(@Body() body: CreateUserDto){
        const user = await this.usersService.createUser(body.username, body.email, body.password, body.displayName);
        // TODO: Create session
        return user;
    }

}
