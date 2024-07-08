-- CreateTable
CREATE TABLE "banned_emails" (
    "sum" VARCHAR(64) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "banned_emails_pkey" PRIMARY KEY ("sum")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(24) NOT NULL,
    "email" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "user_id" INTEGER NOT NULL,
    "display_name" VARCHAR(32) NOT NULL,
    "bio" TEXT,
    "avatar_id" INTEGER,
    "instagram" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "user_id" INTEGER NOT NULL,
    "otp" VARCHAR(6) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "password_change_requests" (
    "user_id" INTEGER NOT NULL,
    "otp" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_change_requests_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "email_changes" (
    "uuid" UUID NOT NULL,
    "user_id" INTEGER NOT NULL,
    "old_email_sum" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_changes_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "email_disputes" (
    "uuid" UUID NOT NULL,
    "email_change_uuid" UUID NOT NULL,
    "context" TEXT NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_disputes_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "sessions" (
    "uuid" UUID NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_agent" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "sum" VARCHAR(64) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_change_requests_otp_key" ON "password_change_requests"("otp");

-- CreateIndex
CREATE UNIQUE INDEX "email_disputes_email_change_uuid_key" ON "email_disputes"("email_change_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "images_sum_key" ON "images"("sum");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_change_requests" ADD CONSTRAINT "password_change_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_changes" ADD CONSTRAINT "email_changes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_disputes" ADD CONSTRAINT "email_disputes_email_change_uuid_fkey" FOREIGN KEY ("email_change_uuid") REFERENCES "email_changes"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
