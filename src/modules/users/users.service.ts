import {ConflictException, ForbiddenException, Injectable} from "@nestjs/common";
import {PrismaService} from "../misc/prisma.service";
import {CipherService} from "../misc/cipher.service";
import {UserEntity} from "./models/entities/user.entity";
import {EmailService} from "../misc/email.service";

@Injectable()
export class UsersService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
        private readonly emailService: EmailService,
    ){}

    async createUser(username: string, email: string, password: string, displayName: string): Promise<UserEntity>{
        const emailSum = this.cipherService.getSum(email);
        const bannedEmail = await this.prismaService.bannedEmails.findFirst({
            where: {
                sum: emailSum,
            }
        });
        if(bannedEmail)
            throw new ForbiddenException("Email is banned");
        const dbUser = await this.prismaService.users.findFirst({
            where: {
                OR: [
                    {
                        username,
                    },
                    {
                        email,
                    }
                ]
            }
        });
        if(dbUser)
            throw new ConflictException("Email or username already exists");
        let user: any;
        let userProfile: any;
        const passwordHash = await this.cipherService.hash(password);
        await this.prismaService.$transaction(async(tx) => {
            user = await tx.users.create({
                data: {
                    username,
                    email,
                    password: passwordHash,
                }
            });
            userProfile = await tx.userProfiles.create({
                data: {
                    user_id: user.id,
                    display_name: displayName,
                }
            });
            const otpVerification = await tx.otpVerifications.create({
                data: {
                    user_id: user.id,
                    otp: this.cipherService.generateRandomNumbers(6),
                    expires_at: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes
                }
            });
            await this.emailService.sendEmail(email, "Verify your email", `Your OTP is ${otpVerification.otp}`);
        });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            verified: false,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            profile: {
                displayName: userProfile.display_name,
            }
        } as UserEntity;
    }

}
