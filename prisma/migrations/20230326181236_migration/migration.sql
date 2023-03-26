/*
  Warnings:

  - You are about to alter the column `value` on the `statisticitem` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `statisticitem` MODIFY `value` DOUBLE NOT NULL;
