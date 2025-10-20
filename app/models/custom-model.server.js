import db from "../db.server";
import { uploadImage, deleteImage } from "../utils/cloudinary.server";

export async function getCustomModels(shop) {
  return await db.customModel.findMany({
    where: { 
      shop,
      active: true 
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function uploadCustomModel({ shop, imageBase64, name, gender }) {
  const uploadResult = await uploadImage(imageBase64, `virtual-tryon/${shop}/models`);
  
  if (!uploadResult.success) {
    throw new Error(uploadResult.error);
  }
  
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

export async function deleteCustomModel(modelId, cloudinaryId) {
  if (cloudinaryId) {
    await deleteImage(cloudinaryId);
  }
  
  await db.customModel.delete({
    where: { id: modelId }
  });
  
  return true;
}