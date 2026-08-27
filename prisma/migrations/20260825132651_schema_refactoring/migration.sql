/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Dish` table. All the data in the column will be lost.
  - You are about to drop the column `dishImageUrl` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `dishName` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `dishNameSnapshot` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "imageUrl",
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "dishImageUrl",
DROP COLUMN "dishName",
ADD COLUMN     "dishImageSnapshot" TEXT,
ADD COLUMN     "dishNameSnapshot" TEXT NOT NULL;
