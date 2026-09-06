import { apiClient } from './client';

export interface UploadImageResponse {
  image: string;
  url: string;
  [key: string]: any;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function extractImageUrl(resData: any): string {
  if (!resData) return '';
  if (typeof resData === 'string') return resData;
  const raw = resData?.data || resData;
  if (typeof raw === 'string') return raw;

  const candidate =
    raw?.image ||
    raw?.imageUrl ||
    raw?.url ||
    raw?.secure_url ||
    raw?.path ||
    raw?.filePath ||
    (raw?.filename ? `/uploads/${raw.filename}` : '') ||
    raw?.location ||
    raw?.file?.url ||
    raw?.file?.path ||
    raw?.file?.filename ||
    raw?.file?.secure_url ||
    raw?.data?.image ||
    raw?.data?.imageUrl ||
    raw?.data?.url ||
    raw?.data?.secure_url ||
    raw?.data?.path ||
    '';
  return typeof candidate === 'string' ? candidate : '';
}

export const uploadApi = {
  /**
   * Téléverse un fichier image vers le backend.
   * - Envoie un FormData avec le champ attendu ('image' en priorité, puis 'file' en cas de rejet Multer)
   * - Supprime le Content-Type pour laisser Axios et le navigateur inclure le délimiteur 'boundary'
   * - Supporte les endpoints courants (/uploads/image, /api/uploads/image, /uploads, /api/uploads, etc.)
   * - En cas d'indisponibilité du serveur distant d'upload, encode en Data URL Base64 de manière transparente
   */
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const endpoints = [
      '/uploads/image',
      '/api/uploads/image',
      '/uploads',
      '/api/uploads',
      '/upload/image',
      '/api/upload/image',
      '/upload',
      '/api/upload',
    ];

    let lastError: any = null;

    for (const endpoint of endpoints) {
      // 1. Essayer d'abord avec le champ 'image'
      try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await apiClient.post<any>(endpoint, formData, {
          headers: {
            'Content-Type': undefined,
          },
        });

        const raw = res.data?.data || res.data;
        const img = extractImageUrl(res.data);
        if (img) {
          return {
            ...raw,
            image: img,
            url: img,
          };
        }
      } catch (err: any) {
        lastError = err;
        const status = err.response?.status;
        const resData = err.response?.data;
        const errStr = JSON.stringify(resData || '').toLowerCase();
        const isMulterFieldIssue =
          status === 400 &&
          (errStr.includes('unexpected field') ||
            errStr.includes('limit_unexpected_file') ||
            errStr.includes('file is required') ||
            errStr.includes('champ requis') ||
            errStr.includes('no file'));

        // 2. Si le backend attend le champ nommé 'file' plutôt que 'image'
        if (isMulterFieldIssue) {
          try {
            const formData2 = new FormData();
            formData2.append('file', file);

            const res2 = await apiClient.post<any>(endpoint, formData2, {
              headers: {
                'Content-Type': undefined,
              },
            });

            const raw2 = res2.data?.data || res2.data;
            const img2 = extractImageUrl(res2.data);
            if (img2) {
              return {
                ...raw2,
                image: img2,
                url: img2,
              };
            }
          } catch (err2: any) {
            lastError = err2;
          }
        }

        // Si la route n'existe pas (404 ou 405), essayer le point de terminaison suivant
        if (status === 404 || status === 405) {
          continue;
        }

        // Si c'est une autre erreur 400, tenter aussi avec 'file'
        if (status === 400 && !isMulterFieldIssue) {
          try {
            const formDataAlt = new FormData();
            formDataAlt.append('file', file);
            const resAlt = await apiClient.post<any>(endpoint, formDataAlt, {
              headers: {
                'Content-Type': undefined,
              },
            });
            const rawAlt = resAlt.data?.data || resAlt.data;
            const imgAlt = extractImageUrl(resAlt.data);
            if (imgAlt) {
              return { ...rawAlt, image: imgAlt, url: imgAlt };
            }
          } catch {
            // Continuer vers l'endpoint suivant
          }
        }
      }
    }

    // Fallback: si aucun endpoint distant n'est configuré ou joignable sur le serveur,
    // convertir en Data URL Base64 pour ne jamais bloquer la création ou modification du plat
    try {
      console.warn("Points d'upload distants non disponibles, bascule transparente sur l'encodage Data URL.");
      const dataUrl = await fileToDataUrl(file);
      return {
        image: dataUrl,
        url: dataUrl,
        isFallback: true,
      };
    } catch {
      if (lastError) {
        throw lastError;
      }
      throw new Error("Impossible d'uploader l'image : aucun point de terminaison n'a répondu.");
    }
  },
};
