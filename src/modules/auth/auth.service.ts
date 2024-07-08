import {Injectable, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../misc/prisma.service";
import {CipherService} from "../misc/cipher.service";

@Injectable()
export class AuthService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    async createSession(email: string, password: string, userAgent: string): Promise<string>{
        const user = await this.prismaService.users.findFirst({
            where: {
                email,
            }
        });
        if(!user)
            throw new NotFoundException("User not found");
        if(!await this.cipherService.compareHash(user.password, password))
            throw new UnauthorizedException("Invalid password");
        const sessionUuid = this.cipherService.generateUuidV7();
        await this.prismaService.sessions.create({
            data: {
                user_id: user.id,
                uuid: sessionUuid,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
                user_agent: userAgent,
            }
        });
        return sessionUuid;
    }

    async createSessionByUserId(userId: number, userAgent: string): Promise<string>{
        const sessionUuid = this.cipherService.generateUuidV7();
        await this.prismaService.sessions.create({
            data: {
                user_id: userId,
                uuid: sessionUuid,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
                user_agent: userAgent,
            }
        });
        return sessionUuid;
    }

    async verifySession(sessionUuid: string, userAgent: string): Promise<number>{
        const session = await this.prismaService.sessions.findFirst({
            where: {
                uuid: sessionUuid,
                user_agent: userAgent,
            }
        });
        if(!session)
            throw new NotFoundException("Session not found");
        if(session.expires_at < new Date())
            throw new UnauthorizedException("Session expired");
        return session.user_id;
    }

    async invalidateSession(id: number, sessionUUID: string){
        await this.prismaService.sessions.deleteMany({
            where: {
                user_id: id,
                uuid: sessionUUID,
            }
        });
    }

    async invalidateUserSessions(id: number){
        await this.prismaService.sessions.deleteMany({
            where: {
                user_id: id,
            }
        });
    }
}
