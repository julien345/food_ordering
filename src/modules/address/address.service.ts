// src/modules/address/address.service.ts
import addressRepository from "./address.repository";

class AddressService {
  async getAll(userId: string) {
    return addressRepository.findAllByUser(userId);
  }

  async getById(id: string, userId: string) {
    const address = await addressRepository.findById(id);
    if (!address) throw new Error("ADDRESS_NOT_FOUND");
    if (address.userId !== userId) throw new Error("FORBIDDEN");
    return address;
  }

  async create(
    userId: string,
    data: {
      label: string;
      street: string;
      city: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    }
  ) {
    if (data.isDefault) {
      await addressRepository.unsetDefaultForUser(userId);
    }
    return addressRepository.create(userId, data);
  }

  async update(
    id: string,
    userId: string,
    data: {
      label?: string;
      street?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    }
  ) {
    await this.getById(id, userId); // vérifie existence + propriété

    if (data.isDefault) {
      await addressRepository.unsetDefaultForUser(userId);
    }
    return addressRepository.update(id, data);
  }

  async remove(id: string, userId: string) {
    await this.getById(id, userId);
    return addressRepository.softDelete(id);
  }
}

export default new AddressService();