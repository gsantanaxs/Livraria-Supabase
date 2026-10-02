import { supabase } from "./supabaseClient";

/**
 * Serviço CRUD para gerenciar livros no Supabase
 * Implementa operações de Create, Read, Update e Delete
 */

// ============ CREATE (Inserir) ============
/**
 * Insere um novo livro no banco de dados
 * @param {Object} livro - Dados do livro
 * @param {string} livro.titulo - Título do livro (obrigatório)
 * @param {string} livro.autor - Autor do livro (obrigatório)
 * @param {number} livro.preco - Preço do livro (obrigatório)
 * @param {number} livro.categoria_id - ID da categoria (obrigatório)
 * @param {number} livro.estoque - Quantidade em estoque
 * @param {string} livro.descricao - Descrição do livro
 * @param {string} livro.imagem_url - URL da capa do livro
 * @param {string} livro.editora - Editora do livro
 * @param {number} livro.ano_publicacao - Ano de publicação
 * @returns {Promise<{dados: Object, erro: Object}>}
 */
export async function criarLivro(livro) {
  try {
    console.log("📝 Inserindo livro:", livro);

    const { data, error } = await supabase
      .from("produtos")
      .insert([{
        titulo: livro.titulo,
        autor: livro.autor,
        preco: parseFloat(livro.preco),
        categoria_id: parseInt(livro.categoria_id),
        estoque: parseInt(livro.estoque) || 0,
        descricao: livro.descricao || "",
        imagem_url: livro.imagem_url || "",
        editora: livro.editora || "",
        ano_publicacao: livro.ano_publicacao ? parseInt(livro.ano_publicacao) : null
      }])
      .select(); // Retorna o registro inserido

    if (error) {
      console.error("❌ Erro ao inserir:", error);
      return { dados: null, erro: error.message };
    }

    console.log("✅ Livro inserido com sucesso:", data);
    return { dados: data[0], erro: null };
  } catch (erro) {
    console.error("❌ Erro inesperado:", erro);
    return { dados: null, erro: erro.message };
  }
}

// ============ READ (Leitura) ============
/**
 * Lê todos os livros do banco de dados
 * @returns {Promise<{dados: Array, erro: Object}>}
 */
export async function lerTodosOsLivros() {
  try {
    console.log("📖 Lendo todos os livros...");

    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("❌ Erro ao ler:", error);
      return { dados: [], erro: error.message };
    }

    console.log("✅ Livros carregados:", data.length);
    return { dados: data || [], erro: null };
  } catch (erro) {
    console.error("❌ Erro inesperado:", erro);
    return { dados: [], erro: erro.message };
  }
}

/**
 * Lê um livro específico pelo ID
 * @param {number} id - ID do livro
 * @returns {Promise<{dados: Object, erro: Object}>}
 */
export async function lerLivroPorId(id) {
  try {
    console.log("🔍 Buscando livro ID:", id);

    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Erro ao buscar:", error);
      return { dados: null, erro: error.message };
    }

    console.log("✅ Livro encontrado:", data);
    return { dados: data, erro: null };
  } catch (erro) {
    console.error("❌ Erro inesperado:", erro);
    return { dados: null, erro: erro.message };
  }
}

// ============ UPDATE (Atualizar) ============
/**
 * Atualiza um livro existente
 * @param {number} id - ID do livro
 * @param {Object} atualizacoes - Dados para atualizar
 * @returns {Promise<{dados: Object, erro: Object}>}
 */
export async function atualizarLivro(id, atualizacoes) {
  try {
    console.log("✏️ Atualizando livro ID:", id);

    const { data, error } = await supabase
      .from("produtos")
      .update({
        ...atualizacoes,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select(); // Retorna o registro atualizado

    if (error) {
      console.error("❌ Erro ao atualizar:", error);
      return { dados: null, erro: error.message };
    }

    console.log("✅ Livro atualizado com sucesso:", data);
    return { dados: data[0], erro: null };
  } catch (erro) {
    console.error("❌ Erro inesperado:", erro);
    return { dados: null, erro: erro.message };
  }
}

// ============ DELETE (Deletar) ============
/**
 * Deleta um livro do banco de dados
 * @param {number} id - ID do livro
 * @returns {Promise<{sucesso: boolean, erro: Object}>}
 */
export async function deletarLivro(id) {
  try {
    console.log("🗑️ Deletando livro ID:", id);

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Erro ao deletar:", error);
      return { sucesso: false, erro: error.message };
    }

    console.log("✅ Livro deletado com sucesso");
    return { sucesso: true, erro: null };
  } catch (erro) {
    console.error("❌ Erro inesperado:", erro);
    return { sucesso: false, erro: erro.message };
  }
}

// ============ REAL-TIME SYNC (Sincronização em tempo real) ============
/**
 * Inscreve-se às mudanças da tabela produtos em tempo real
 * @param {Function} callback - Função chamada quando há mudanças
 * @returns {Promise<Object>} - Subscription para desinscrição posterior
 */
export async function inscreverAMudancas(callback) {
  try {
    console.log("🔔 Inscrevendo-se às mudanças em tempo real...");

    const subscription = supabase
      .channel("produtos_mudancas")
      .on(
        "postgres_changes",
        {
          event: "*", // Ouve INSERT, UPDATE, DELETE
          schema: "public",
          table: "produtos"
        },
        (payload) => {
          console.log("⚡ Mudança detectada:", payload.eventType);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log("📡 Status da inscrição:", status);
      });

    return subscription;
  } catch (erro) {
    console.error("❌ Erro ao inscrever:", erro);
    return null;
  }
}

/**
 * Desinscreve-se das mudanças em tempo real
 * @param {Object} subscription - Objeto de subscription retornado por inscreverAMudancas
 */
export async function desinscreverDeMudancas(subscription) {
  try {
    if (subscription) {
      await supabase.removeChannel(subscription);
      console.log("✅ Desinscrição realizada");
    }
  } catch (erro) {
    console.error("❌ Erro ao desinscrever:", erro);
  }
}
