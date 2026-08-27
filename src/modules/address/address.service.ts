import addressRepository from "./address.repository";
import prisma from "../../config/prisma";
import { NotFoundError, ForbiddenError } from "../../errors";
import { CreateAddressInput, UpdateAddressInput } from "../../validators/address.validator";

class AddressService {
  async getAll(userId: string) {
    return addressRepository.findAllByUser(userId);
  }

  async getById(id: string, userId: string) {
    const address = await addressRepository.findById(id);
    if (!address) throw new NotFoundError("Adresse introuvable.");
    if (address.userId !== userId) throw new ForbiddenError();
    return address;
  }

async create(userId: string, data: CreateAddressInput) {
  return prisma.$transaction(async (tx) => {
    const existingAddressesCount = await tx.address.count({
      where: { userId, deletedAt: null },
    });
    const shouldBeDefault = existingAddressesCount === 0 || data.isDefault;
    if (shouldBeDefault) {
      await addressRepository.unsetDefaultForUser(userId, tx);
    }
    return addressRepository.create(userId, { ...data, isDefault: shouldBeDefault }, tx);
  });
}


  async update(id: string, userId: string, data: UpdateAddressInput) {
    await this.getById(id, userId);

    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await addressRepository.unsetDefaultForUser(userId, tx);
      }
      return addressRepository.update(id, data, tx);
    });
  }

  async remove(id: string, userId: string) {
    const address = await this.getById(id, userId);

    return prisma.$transaction(async (tx) => {
      await addressRepository.softDelete(id, tx);

      if (address.isDefault) {
        const fallbackAddress = await addressRepository.findLatestActiveByUser(userId, tx);
        if (fallbackAddress) {
          await addressRepository.update(fallbackAddress.id, { isDefault: true }, tx);
        }
      }
    });
  }
}

export default new AddressService();