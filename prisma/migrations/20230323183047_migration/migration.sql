-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `login` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_login_key`(`login`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `refresh` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Token_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cloud` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `memory` INTEGER NOT NULL DEFAULT 2000000000,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Cloud_name_key`(`name`),
    UNIQUE INDEX `Cloud_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Folder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `pathName` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `favorite` BOOLEAN NOT NULL DEFAULT false,
    `pined` BOOLEAN NOT NULL DEFAULT false,
    `freezed` BOOLEAN NOT NULL DEFAULT false,
    `trashed` BOOLEAN NOT NULL DEFAULT false,
    `shared` BOOLEAN NOT NULL DEFAULT false,
    `cloudId` INTEGER NOT NULL,
    `parentId` INTEGER NULL,

    UNIQUE INDEX `Folder_pathName_key`(`pathName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `File` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `pathName` VARCHAR(191) NOT NULL,
    `extension` VARCHAR(191) NULL,
    `size` INTEGER NOT NULL DEFAULT 0,
    `favorite` BOOLEAN NOT NULL DEFAULT false,
    `pined` BOOLEAN NOT NULL DEFAULT false,
    `freezed` BOOLEAN NOT NULL DEFAULT false,
    `trashed` BOOLEAN NOT NULL DEFAULT false,
    `shared` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `cloudId` INTEGER NOT NULL,
    `folderId` INTEGER NULL,

    UNIQUE INDEX `File_pathName_key`(`pathName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trash` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dir` BOOLEAN NOT NULL DEFAULT false,
    `parentId` INTEGER NULL,
    `cloudId` INTEGER NOT NULL,
    `folderId` INTEGER NULL,
    `fileId` INTEGER NULL,

    UNIQUE INDEX `Trash_folderId_key`(`folderId`),
    UNIQUE INDEX `Trash_fileId_key`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SharedList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dir` BOOLEAN NOT NULL DEFAULT false,
    `open` BOOLEAN NOT NULL DEFAULT true,
    `AccessAction` ENUM('READ', 'EDIT') NOT NULL DEFAULT 'READ',
    `folderId` INTEGER NULL,
    `fileId` INTEGER NULL,

    UNIQUE INDEX `SharedList_folderId_key`(`folderId`),
    UNIQUE INDEX `SharedList_fileId_key`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Statistic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeAmount` INTEGER NOT NULL DEFAULT 2000000000,
    `usedAmount` INTEGER NOT NULL DEFAULT 0,
    `cloudId` INTEGER NULL,

    UNIQUE INDEX `Statistic_cloudId_key`(`cloudId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatisticItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL,
    `statisticId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cloud` ADD CONSTRAINT `Cloud_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Folder` ADD CONSTRAINT `Folder_cloudId_fkey` FOREIGN KEY (`cloudId`) REFERENCES `Cloud`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Folder` ADD CONSTRAINT `Folder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_cloudId_fkey` FOREIGN KEY (`cloudId`) REFERENCES `Cloud`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trash` ADD CONSTRAINT `Trash_cloudId_fkey` FOREIGN KEY (`cloudId`) REFERENCES `Cloud`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trash` ADD CONSTRAINT `Trash_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trash` ADD CONSTRAINT `Trash_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SharedList` ADD CONSTRAINT `SharedList_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SharedList` ADD CONSTRAINT `SharedList_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Statistic` ADD CONSTRAINT `Statistic_cloudId_fkey` FOREIGN KEY (`cloudId`) REFERENCES `Cloud`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatisticItem` ADD CONSTRAINT `StatisticItem_statisticId_fkey` FOREIGN KEY (`statisticId`) REFERENCES `Statistic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
