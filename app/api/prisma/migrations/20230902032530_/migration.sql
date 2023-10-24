-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "id42" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "login42" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "login" TEXT,
    "token" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendship" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "password" TEXT,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER,
    "discussionId" INTEGER,
    "senderId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "conversationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("conversationId","userId")
);

-- CreateTable
CREATE TABLE "conversationManagement" (
    "conversationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "conversationManagement_pkey" PRIMARY KEY ("conversationId","userId")
);

-- CreateTable
CREATE TABLE "discussion" (
    "id" SERIAL NOT NULL,
    "participant1Id" INTEGER NOT NULL,
    "participant2Id" INTEGER NOT NULL,

    CONSTRAINT "discussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bannedUser" (
    "userBannedId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "userBannerId" INTEGER NOT NULL,

    CONSTRAINT "bannedUser_pkey" PRIMARY KEY ("userBannedId","conversationId")
);

-- CreateTable
CREATE TABLE "blockedUser" (
    "blockedById" INTEGER NOT NULL,
    "blockedUserId" INTEGER NOT NULL,

    CONSTRAINT "blockedUser_pkey" PRIMARY KEY ("blockedById","blockedUserId")
);

-- CreateTable
CREATE TABLE "mutedUser" (
    "userId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "mutedUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mutedUser_pkey" PRIMARY KEY ("userId","conversationId")
);

-- CreateTable
CREATE TABLE "game" (
    "id" SERIAL NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "winnerId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_id42_key" ON "user"("id42");

-- CreateIndex
CREATE UNIQUE INDEX "user_image_key" ON "user"("image");

-- CreateIndex
CREATE UNIQUE INDEX "user_login42_key" ON "user"("login42");

-- CreateIndex
CREATE UNIQUE INDEX "user_url_key" ON "user"("url");

-- CreateIndex
CREATE UNIQUE INDEX "user_login_key" ON "user"("login");

-- CreateIndex
CREATE UNIQUE INDEX "friendship_id_key" ON "friendship"("id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_name_key" ON "conversation"("name");

-- AddForeignKey
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_own_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_recv_fkey" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversationManagement" ADD CONSTRAINT "conversationManagement_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversationManagement" ADD CONSTRAINT "conversationManagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bannedUser" ADD CONSTRAINT "bannedUser_userBannedId_fkey" FOREIGN KEY ("userBannedId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bannedUser" ADD CONSTRAINT "bannedUser_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bannedUser" ADD CONSTRAINT "bannedUser_userBannerId_fkey" FOREIGN KEY ("userBannerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockedUser" ADD CONSTRAINT "blockedUser_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockedUser" ADD CONSTRAINT "blockedUser_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutedUser" ADD CONSTRAINT "mutedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutedUser" ADD CONSTRAINT "mutedUser_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
