import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import {PrismaService} from "../misc/prisma.service";
import {CipherService} from "../misc/cipher.service";
import {UserEntity} from "./models/entities/user.entity";
import {EmailService} from "../misc/email.service";
import {UserProfileEntity} from "./models/entities/user-profile.entity";

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
            } as UserProfileEntity,
        } as UserEntity;
    }

    async getUserById(userId: number): Promise<UserEntity>{
        const user = await this.prismaService.users.findUnique({
            where: {
                id: userId,
            },
            include: {
                user_profile: {
                    include: {
                        avatar: true,
                    }
                },
            }
        });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            verified: !!user.verified_at,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            profile: {
                displayName: user.user_profile.display_name,
                bio: user.user_profile.bio,
                avatarSum: user.user_profile.avatar?.sum,
                instagram: user.user_profile.instagram,
                facebook: user.user_profile.facebook,
                twitter: user.user_profile.twitter,
            } as UserProfileEntity,
        } as UserEntity;
    }

    async confirmEmail(userId: number, otp: string){
        const otpVerification = await this.prismaService.otpVerifications.findFirst({
            where: {
                user_id: userId,
                otp
            }
        });
        if(!otpVerification)
            throw new BadRequestException("Invalid OTP");
        if(otpVerification.expires_at < new Date()){
            await this.prismaService.otpVerifications.delete({
                where: {
                    user_id: otpVerification.user_id,
                }
            });
            throw new ForbiddenException("OTP expired");
        }

        await this.prismaService.$transaction(async(tx) => {
            await tx.otpVerifications.delete({
                where: {
                    user_id: otpVerification.user_id,
                }
            });
            await tx.users.update({
                where: {
                    id: userId,
                },
                data: {
                    verified_at: new Date(),
                }
            });
        });
    }

    async resendEmailConfirmation(userId: number){
        const user = await this.prismaService.users.findUnique({
            where: {
                id: userId,
            }
        });
        if(!user)
            throw new NotFoundException("User not found");
        if(user.verified_at)
            throw new BadRequestException("User already verified");

        const otpVerification = await this.prismaService.otpVerifications.findFirst({
            where: {
                user_id: userId,
            }
        });
        if(otpVerification){
            if (otpVerification.expires_at < new Date())
                await this.prismaService.otpVerifications.delete({
                    where: {
                        user_id: userId,
                    }
                });
            else
                throw new BadRequestException("OTP already sent");
        }

        await this.prismaService.$transaction(async(tx) => {
            const otpVerification = await tx.otpVerifications.create({
                data: {
                    user_id: userId,
                    otp: this.cipherService.generateRandomNumbers(6),
                    expires_at: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes
                }
            });
            await this.emailService.sendEmail(user.email, "Verify your email", `Your OTP is ${otpVerification.otp}`);
        });
    }
}
