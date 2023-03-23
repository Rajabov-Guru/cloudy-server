/*
  Warnings:

  - You are about to drop the column `folderId` on the `file` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `file` DROP FOREIGN KEY `File_folderId_fkey`;

-- AlterTable
ALTER TABLE `file` DROP COLUMN `folderId`,
    ADD COLUMN `parentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
