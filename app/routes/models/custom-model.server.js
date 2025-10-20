import db from "../db.server";
import { uploadImage, deleteImage } from "../utils/cloudinary.server";

/**
 * Get all custom models for a shop
 */
export async function getCustomModels(shop) {
  return await db.customModel.findMany({
    where: { 
      shop,
      active: true 
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Upload and save a custom model
 */
export async function uploadCustomModel({ shop, imageBase64, name, gender }) {
  // Cloudinary'ye yükle
  const uploadResult = await uploadImage(imageBase64, `virtual-tryon/${shop}/models`);
  
  if (!uploadResult.success) {
    throw new Error(uploadResult.error);
  }
  
  // Database'e kaydet
  const model = await db.customModel.create({
    data: {
      shop,
      name: name || "Custom Model",
      url: uploadResult.url,
      cloudinaryId: uploadResult.publicId,
      gender: gender || "male",
    }
  });
  
  return model;
}

/**
 * Delete a custom model
 */
export async function deleteCustomModel(modelId, cloudinaryId) {
  // Cloudinary'den sil
  if (cloudinaryId) {
    await deleteImage(cloudinaryId);
  }
  
  // Database'den sil
  await db.customModel.delete({
    where: { id: modelId }
  });
  
  return true;
}