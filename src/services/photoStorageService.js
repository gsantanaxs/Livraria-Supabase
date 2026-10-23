import { supabase } from "./supabaseClient";

const PHOTO_BUCKET = "user-photos";

export async function uploadBookImage(blob, userId) {
  if (!userId) {
    throw new Error("Entre na sua conta para enviar fotos ao armazenamento.");
  }

  if (!blob?.size || !blob.type.startsWith("image/")) {
    throw new Error("Selecione uma imagem válida antes de salvar o livro.");
  }

  const contentType = blob.type.split(";")[0].toLowerCase();
  const subtype = contentType.split("/")[1] || "img";
  const extension = subtype.split("+")[0].replace(/[^a-z0-9]/g, "") || "img";
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

  return { publicUrl: data.publicUrl, filePath };
}

export async function deleteBookImage(filePath) {
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .remove([filePath]);

  if (error) {
    throw new Error(`Não foi possível remover a imagem enviada: ${error.message}`);
  }
}
