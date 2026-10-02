/**
 * EXEMPLOS PRÁTICOS DE USO DO CRUD SERVICE
 * 
 * Este arquivo mostra como usar o crudService.js em variadas situações
 * Execute cada bloco de código em um console ou integre em seu componente React
 */

import {
  criarLivro,
  lerTodosOsLivros,
  lerLivroPorId,
  atualizarLivro,
  deletarLivro,
  inscreverAMudancas,
  desinscreverDeMudancas
} from "./services/crudService";

// ============================================================
// EXEMPLO 1: CRIAR UM NOVO LIVRO
// ============================================================
async function exemplo1_CriarLivro() {
  console.log("📝 Exemplo 1: Criando um novo livro...");

  const novoLivro = {
    titulo: "Dom Casmurro",
    autor: "Machado de Assis",
    preco: 39.90,
    categoria: "Ficção",
    estoque: 15,
    descricao: "Uma das obras-primas da literatura brasileira que aborda temas de ciúme, traição e memória.",
    imagem_url: "https://via.placeholder.com/300x400?text=Dom+Casmurro"
  };

  const { dados, erro } = await criarLivro(novoLivro);

  if (erro) {
    console.error("❌ Erro ao criar:", erro);
  } else {
    console.log("✅ Livro criado com sucesso!");
    console.log("ID gerado:", dados.id);
    console.log("Dados completos:", dados);
  }
}

// ============================================================
// EXEMPLO 2: LER TODOS OS LIVROS
// ============================================================
async function exemplo2_LerTodosOsLivros() {
  console.log("📖 Exemplo 2: Lendo todos os livros...");

  const { dados, erro } = await lerTodosOsLivros();

  if (erro) {
    console.error("❌ Erro ao ler:", erro);
  } else {
    console.log(`✅ ${dados.length} livro(s) encontrado(s)`);
    
    // Iterar sobre cada livro
    dados.forEach((livro) => {
      console.log(`
        📚 ${livro.titulo}
        👤 Autor: ${livro.autor}
        💰 Preço: R$ ${livro.preco.toFixed(2)}
        📂 Categoria: ${livro.categoria}
        📦 Estoque: ${livro.estoque} unidades
      `);
    });
  }
}

// ============================================================
// EXEMPLO 3: LER UM LIVRO ESPECÍFICO
// ============================================================
async function exemplo3_LerLivroPorId(id = 1) {
  console.log(`🔍 Exemplo 3: Buscando livro ID ${id}...`);

  const { dados, erro } = await lerLivroPorId(id);

  if (erro) {
    console.error("❌ Erro ao buscar:", erro);
  } else if (!dados) {
    console.warn("⚠️ Livro não encontrado");
  } else {
    console.log("✅ Livro encontrado!");
    console.log("Título:", dados.titulo);
    console.log("Autor:", dados.autor);
    console.log("Preço:", `R$ ${dados.preco.toFixed(2)}`);
    console.log("Estoque:", dados.estoque);
  }
}

// ============================================================
// EXEMPLO 4: ATUALIZAR UM LIVRO
// ============================================================
async function exemplo4_AtualizarLivro(id = 1) {
  console.log(`✏️ Exemplo 4: Atualizando livro ID ${id}...`);

  // Atualizar apenas o preço e estoque
  const atualizacoes = {
    preco: 49.90,      // Novo preço
    estoque: 20,       // Novo estoque
    // Nota: Você pode atualizar qualquer campo!
  };

  const { dados, erro } = await atualizarLivro(id, atualizacoes);

  if (erro) {
    console.error("❌ Erro ao atualizar:", erro);
  } else {
    console.log("✅ Livro atualizado com sucesso!");
    console.log("Novo preço:", `R$ ${dados.preco.toFixed(2)}`);
    console.log("Novo estoque:", dados.estoque);
    console.log("Atualizado em:", dados.updated_at);
  }
}

// ============================================================
// EXEMPLO 5: DELETAR UM LIVRO
// ============================================================
async function exemplo5_DeletarLivro(id = 1) {
  console.log(`🗑️ Exemplo 5: Deletando livro ID ${id}...`);

  const { sucesso, erro } = await deletarLivro(id);

  if (erro) {
    console.error("❌ Erro ao deletar:", erro);
  } else if (sucesso) {
    console.log("✅ Livro deletado com sucesso!");
    console.log("O registro foi removido do banco de dados.");
  }
}

// ============================================================
// EXEMPLO 6: SINCRONIZAÇÃO EM TEMPO REAL
// ============================================================
async function exemplo6_SincronizacaoTempoReal() {
  console.log("⚡ Exemplo 6: Sincronização em tempo real...");
  console.log("Este exemplo mostra como se inscrever às mudanças do banco de dados");

  let subscription = null;

  try {
    subscription = await inscreverAMudancas((payload) => {
      console.log("📡 Mudança detectada!");
      console.log("Tipo:", payload.eventType); // INSERT, UPDATE, DELETE
      console.log("Novo valor:", payload.new);
      console.log("Valor anterior:", payload.old);

      // Aqui você poderia:
      // - Recarregar a lista de livros
      // - Atualizar o componente React
      // - Notificar o usuário
      // - Log em analytics, etc.
    });

    console.log("✅ Inscrição ativa. Aguardando mudanças...");
    console.log("Abra outra aba/navegador e crie/edit/delete um livro para ver as mudanças!");

    // Aguardar 60 segundos antes de desinscrever
    setTimeout(async () => {
      console.log("Desinscrição...");
      await desinscreverDeMudancas(subscription);
      console.log("✅ Desinscrição concluída");
    }, 60000);

  } catch (erro) {
    console.error("❌ Erro na sincronização:", erro);
  }
}

// ============================================================
// EXEMPLO 7: FLUXO COMPLETO NO REACT (Componente)
// ============================================================
/*
import { useEffect, useState } from "react";

function MinhaAplicacao() {
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    async function inicializar() {
      // 1. Carregar livros
      const { dados } = await lerTodosOsLivros();
      setLivros(dados);
      setLoading(false);

      // 2. Inscrever-se às mudanças
      const sub = await inscreverAMudancas(async (payload) => {
        // Quando houver mudança, recarregar lista
        const novosDados = await lerTodosOsLivros();
        setLivros(novosDados.dados);
      });

      setSubscription(sub);
    }

    inicializar();

    // Cleanup
    return () => {
      if (subscription) {
        desinscreverDeMudancas(subscription);
      }
    };
  }, []);

  return (
    <div>
      {loading && <p>Carregando...</p>}
      
      <ul>
        {livros.map((livro) => (
          <li key={livro.id}>
            {livro.titulo} - {livro.autor}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MinhaAplicacao;
*/

// ============================================================
// EXEMPLO 8: TRATAMENTO DE ERROS AVANÇADO
// ============================================================
async function exemplo8_TratamentoDeErros() {
  console.log("⚠️ Exemplo 8: Tratamento robusto de erros...");

  try {
    // Tentar criar um livro com dados inválidos
    const livroInvalido = {
      titulo: "",  // Título vazio (pode causar erro)
      autor: "",
      preco: "não é número"  // Não é um número
    };

    const { dados, erro } = await criarLivro(livroInvalido);

    if (erro) {
      console.error("Erro do Supabase:", erro);
      
      // Você poderia fazer tratamento específico aqui
      if (erro.includes("null")) {
        console.log("💡 Dica: Alguns campos obrigatórios estão vazios");
      } else if (erro.includes("type")) {
        console.log("💡 Dica: Um dos campos tem tipo de dado inválido");
      } else {
        console.log("💡 Erro desconhecido:", erro);
      }
    }
  } catch (erro) {
    console.error("Erro JavaScript:", erro);
  }
}

// ============================================================
// EXEMPLO 9: OPERAÇÕES EM LOTE
// ============================================================
async function exemplo9_OperacoesEmLote() {
  console.log("📦 Exemplo 9: Criar múltiplos livros...");

  const livros = [
    {
      titulo: "Quincas Borba",
      autor: "Machado de Assis",
      preco: 42.00,
      categoria: "Ficção",
      estoque: 12
    },
    {
      titulo: "Memórias Póstumas de Brás Cubas",
      autor: "Machado de Assis",
      preco: 45.90,
      categoria: "Ficção",
      estoque: 8
    },
    {
      titulo: "Esaú e Jacó",
      autor: "Machado de Assis",
      preco: 38.50,
      categoria: "Ficção",
      estoque: 6
    }
  ];

  let sucessos = 0;
  let erros = 0;

  for (const livro of livros) {
    const { dados, erro } = await criarLivro(livro);
    
    if (erro) {
      console.error(`❌ Erro ao criar "${livro.titulo}":`, erro);
      erros++;
    } else {
      console.log(`✅ Criado: "${livro.titulo}" (ID: ${dados.id})`);
      sucessos++;
    }
  }

  console.log(`\n📊 Resumo: ${sucessos} sucesso(s), ${erros} erro(s)`);
}

// ============================================================
// EXEMPLO 10: FILTRAR E ORDENAR (Lado do Cliente)
// ============================================================
async function exemplo10_FiltrarEOrdenar() {
  console.log("🔎 Exemplo 10: Filtrar e ordenar livros...");

  const { dados: todosOsLivros } = await lerTodosOsLivros();

  // Filtro 1: Apenas livros com preço < R$ 50
  const livrosBaratos = todosOsLivros.filter((livro) => livro.preco < 50);
  console.log(`Livros com preço < R$ 50: ${livrosBaratos.length}`);

  // Filtro 2: Apenas categoria Ficção
  const ficcao = todosOsLivros.filter((livro) => livro.categoria === "Ficção");
  console.log(`Livros de Ficção: ${ficcao.length}`);

  // Ordenar por preço (crescente)
  const porPreco = [...todosOsLivros].sort((a, b) => a.preco - b.preco);
  console.log("Ordenado por preço (crescente):", porPreco.map((l) => `${l.titulo} (R$ ${l.preco})`));

  // Ordenar por autor (alfabético)
  const porAutor = [...todosOsLivros].sort((a, b) => a.autor.localeCompare(b.autor));
  console.log("Ordenado por autor:", porAutor.map((l) => `${l.autor} - ${l.titulo}`));
}

// ============================================================
// EXECUTAR EXEMPLOS
// ============================================================
/*
Para testar, execute no console do navegador:

await exemplo1_CriarLivro();
await exemplo2_LerTodosOsLivros();
await exemplo3_LerLivroPorId(1);
await exemplo4_AtualizarLivro(1);
await exemplo5_DeletarLivro(1);
await exemplo6_SincronizacaoTempoReal();
await exemplo8_TratamentoDeErros();
await exemplo9_OperacoesEmLote();
await exemplo10_FiltrarEOrdenar();

Ou chame tudo junto:
window.exemplosCRUD = {
  exemplo1_CriarLivro,
  exemplo2_LerTodosOsLivros,
  exemplo3_LerLivroPorId,
  exemplo4_AtualizarLivro,
  exemplo5_DeletarLivro,
  exemplo6_SincronizacaoTempoReal,
  exemplo8_TratamentoDeErros,
  exemplo9_OperacoesEmLote,
  exemplo10_FiltrarEOrdenar
};
*/

// ============================================================
// DICAS E BOAS PRÁTICAS
// ============================================================
/*
✅ FAZER:
- Sempre validar dados antes de enviar
- Tratar erros do Supabase apropriadamente
- Usar try/catch para erros inesperados
- Inscrever-se às mudanças para UX em tempo real
- Desinscrever-se ao desmontar componentes
- Dar feedback visual ao usuário
- Usar confirmação antes de deletar

❌ NÃO FAZER:
- Fazer requisições em loop sem controle
- Ignorar erros do banco de dados
- Deixar subscriptions abertas indefinidamente
- Atualizar estado sem sincronizar com servidor
- Confiança cega em dados do cliente
- Operações sensíveis sem autenticação
- Bloquear UI durante requisições longas
*/

export {
  exemplo1_CriarLivro,
  exemplo2_LerTodosOsLivros,
  exemplo3_LerLivroPorId,
  exemplo4_AtualizarLivro,
  exemplo5_DeletarLivro,
  exemplo6_SincronizacaoTempoReal,
  exemplo8_TratamentoDeErros,
  exemplo9_OperacoesEmLote,
  exemplo10_FiltrarEOrdenar
};
