import addressRepository from "./address.repository";
import { NotFoundError, ForbiddenError } from "../../errors";

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
    await this.getById(id, userId);

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