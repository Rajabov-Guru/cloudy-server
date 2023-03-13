/*
  Warnings:

  - Made the column `folderId` on table `file` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `file` DROP FOREIGN KEY `File_folderId_fkey`;

-- AlterTable
ALTER TABLE `file` MODIFY `folderId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
