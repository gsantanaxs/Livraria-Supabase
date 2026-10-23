import { supabase } from "./supabaseClient";

const PHOTO_BUCKET = "user-photos";

export async function uploadCameraPhoto(photo, userId) {
  if (!photo?.webPath) {
    throw new Error("A câmera não retornou uma URI válida para a imagem.");
  }

  if (!userId) {
    throw new Error("Entre na sua conta para enviar fotos ao armazenamento.");
  }

  const response = await fetch(photo.webPath);
  if (!response.ok) {
    throw new Error("Não foi possível converter a imagem capturada para upload.");
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new Error("A imagem capturada está vazia.");
  }

  const contentType = blob.type || `image/${photo.format || "jpeg"}`;
  const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1] || "jpg";
  const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(filePath, blob, { contentType, upsert: false });

  if (error) {
    throw new Error(`Falha no upload da foto: ${error.message}`);
  }

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(filePath);
  if (!data.publicUrl) {
    throw new Error("O Supabase não retornou a URL pública da imagem.");
  }

  return data.publicUrl;
}
