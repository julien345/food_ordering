// 📄 src/modules/upload/upload.service.ts
import cloudinary from "../../config/cloudinary";
import { BadRequestError } from "../../errors";

class UploadService {
  uploadImage(fileBuffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error) {
            // 💡 AJOUTEZ CE LOG : Il va vous dire exactement pourquoi Cloudinary refuse !
            console.error("[CLOUDINARY ERROR DETAILS]:", error); 
            return reject(new BadRequestError("Échec de l'upload de l'image."));
          }
          if (!result) {
            return reject(new BadRequestError("Échec de l'upload de l'image."));
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(fileBuffer);
    });
  }
}

export default new UploadService();
