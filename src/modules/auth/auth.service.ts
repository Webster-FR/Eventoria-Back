import {Injectable, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../misc/prisma.service";
import {CipherService} from "../misc/cipher.service";
import {ConfigService} from "@nestjs/config";
import {PublicSessionEntity} from "../users/models/entities/public-session.entity";

@Injectable()
export class AuthService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
        private readonly configService: ConfigService,
    ){}

    async createSession(email: string, password: string, userAgent: string, remember: boolean): Promise<any>{
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
        const duration: number = remember ? parseInt(this.configService.get("LONG_SESSION_DURATION")) : parseInt(this.configService.get("SESSION_DURATION"));
        await this.prismaService.sessions.create({
            data: {
                user_id: user.id,
                uuid: sessionUuid,
                expires_at: new Date(Date.now() + 1000 * duration),
                user_agent: userAgent,
            }
        });
        return {sessionUuid, userId: user.id};
    }

    async createSessionByUserId(userId: number, userAgent: string, remember: boolean): Promise<string>{
        const sessionUuid = this.cipherService.generateUuidV7();
        const duration: number = remember ? parseInt(this.configService.get("LONG_SESSION_DURATION")) : parseInt(this.configService.get("SESSION_DURATION"));
        await this.prismaService.sessions.create({
            data: {
                user_id: userId,
                uuid: sessionUuid,
                expires_at: new Date(Date.now() + 1000 * duration),
                user_agent: userAgent,
            }
        });
        return sessionUuid;
    }

    async verifySession(sessionUuid: string, userAgent: string): Promise<number>{
        if(sessionUuid === "undefined")
            throw new UnauthorizedException("Session not found");
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

    async invalidateUserSessions(userId: number){
        await this.prismaService.sessions.deleteMany({
            where: {
                user_id: userId,
            }
        });
    }

    async getSessions(userId: number): Promise<PublicSessionEntity[]>{
        const sessions = await this.prismaService.sessions.findMany({
            where: {
                user_id: userId,
            }
        });
        // Map with for loop
        const publicSessions: PublicSessionEntity[] = [];
        for(const session of sessions){
            const {browser, os, device} = this.parseUserAgent(session.user_agent);
            publicSessions.push({
                id: session.uuid,
                browserName: browser.name,
                browserVersion: browser.version,
                os,
                device,
                expiresAt: session.expires_at,
            });
        }
        return publicSessions;
    }

    private parseUserAgent(userAgent: string): any {
        const browserMatch = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        const versionMatch = userAgent.match(/version\/(\d+)/i);
        const osMatch = userAgent.match(/(windows nt|mac os x|android|linux|iphone|ipad|windows phone)/i) || [];
        const deviceMatch = userAgent.match(/(mobile|tablet)/i) || ["desktop"];

        // Process browser and version
        let browser = browserMatch[1] ? browserMatch[1].toLowerCase() : "unknown";
        let version = versionMatch ? versionMatch[1] : browserMatch[2] ? browserMatch[2] : "unknown";

        // Special handling for IE versions
        if (/trident/i.test(browser)){
            const ieVersionMatch = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
            browser = "msie";
            version = ieVersionMatch[1] || "unknown";
        }

        return {
            browser: {
                name: browser,
                version: version
            },
            os: osMatch[1] ? osMatch[1].toLowerCase() : "unknown",
            device: deviceMatch[0].toLowerCase()
        };
    }
}
