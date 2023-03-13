-- DropForeignKey
ALTER TABLE `file` DROP FOREIGN KEY `File_folderId_fkey`;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
