# 📚 Guia Completo: CRUD com React e Supabase

## 🎯 Objetivo
Este guia explica como implementar um sistema completo de **CRUD (Create, Read, Update, Delete)** em uma aplicação React com sincronização em tempo real usando Supabase, operando em uma arquitetura híbrida na nuvem.

---

## 📋 Índice
1. [Arquitetura do Projeto](#arquitetura)
2. [Serviço CRUD (crudService.js)](#servico-crud)
3. [Implementação na Aplicação](#implementação)
4. [Ciclo Completo CRUD](#ciclo-crud)
5. [Sincronização em Tempo Real](#sincronização)
6. [Como Usar](#como-usar)
7. [Tratamento de Erros](#erros)

---

## 🏗️ Arquitetura do Projeto {#arquitetura}

```
src/
├── App.jsx                           # Componente principal com UI
├── main.jsx                          # Entrada da aplicação
├── services/
│   ├── supabaseClient.js            # Inicialização do Supabase
│   └── crudService.js               # Funções CRUD (novo!)
```

### Fluxo de Dados

```
React State (Local)
        ↓
    Formulário (UI)
        ↓
    Função CRUD
        ↓
    Supabase API
        ↓
    Banco de Dados Remoto
        ↓
    Realtime Listener
        ↓
    Atualiza React State
```

---

## 🔧 Serviço CRUD (crudService.js) {#servico-crud}

### 1. CREATE (Crear/Inserir)

```javascript
const resultado = await criarLivro({
  titulo: "Memórias Póstumas de Brás Cubas",
  autor: "Machado de Assis",
  preco: 45.90,
  categoria: "Ficção",
  estoque: 10,
  descricao: "Um clássico da literatura brasileira",
  imagem_url: "https://..."
});

if (resultado.erro) {
  console.error("Erro:", resultado.erro);
} else {
  console.log("Livro criado:", resultado.dados);
}
```

**O que acontece internamente:**
- ✅ Valida os dados
- ✅ Envia para Supabase via SDK
- ✅ Armazena no banco de dados remoto
- ✅ Retorna o registro inserido com ID
- ✅ Listeners em tempo real notificam outros usuários

---

### 2. READ (Ler/Consultar)

```javascript
// Ler TODOS os livros
const resultado = await lerTodosOsLivros();
const livros = resultado.dados;

// Ler UM livro por ID
const resultado = await lerLivroPorId(123);
const livro = resultado.dados;
```

**Características:**
- 📖 Retorna array de livros ordenados por ID
- 🔍 Consulta em tempo real do banco remoto
- ⚡ Otimizado com cache quando possível
- 📊 Incluir todas as colunas: id, título, autor, preço, categoria, estoque, descrição, imagem_url, datas

---

### 3. UPDATE (Atualizar)

```javascript
const resultado = await atualizarLivro(123, {
  titulo: "Novo Título",
  preco: 59.90,
  estoque: 5
  // Não precisa incluir todos os campos - apenas os que mudam
});

if (resultado.erro) {
  console.error("Erro:", resultado.erro);
} else {
  console.log("Livro atualizado:", resultado.dados);
}
```

**Comportamento:**
- ✏️ Atualiza apenas os campos fornecidos
- 🕐 Adiciona automaticamente timestamp de `updated_at`
- 🔄 Sincroniza com outros usuários em tempo real
- 📝 Mantém dados não alterados intactos

---

### 4. DELETE (Deletar)

```javascript
const resultado = await deletarLivro(123);

if (resultado.sucesso) {
  console.log("Livro removido com sucesso");
} else {
  console.error("Erro:", resultado.erro);
}
```

**Cuidados:**
- ⚠️ Ação irreversível - pede confirmação no UI
- 🗑️ Remove o registro completamente do banco
- 🔄 Notifica todos os usuários conectados
- 📱 Sincroniza em tempo real em todos os clientes

---

### 5. Real-Time Sync (Sincronização em Tempo Real) {#sincronização}

```javascript
// Inscrever-se às mudanças
const subscription = await inscreverAMudancas((payload) => {
  console.log("Tipo de mudança:", payload.eventType);
  // INSERT, UPDATE, DELETE
  
  // Recarregar dados quando houver mudança
  const novosDados = await lerTodosOsLivros();
  setProdutos(novosDados.dados);
});

// Mais tarde, desinscrever-se
await desinscreverDeMudancas(subscription);
```

**O que monitora:**
- ⚡ INSERT - novo livro adicionado
- ⚡ UPDATE - livro modificado
- ⚡ DELETE - livro removido

---

## 💻 Implementação na Aplicação {#implementação}

### Estrutura de Estado

```javascript
// Estado local (React)
const [produtos, setProdutos] = useState([]);           // Lista de livros
const [formulario, setFormulario] = useState({...});    // Dados do formulário
const [modo, setModo] = useState("listar");             // listar, criar, editar
const [livroEditando, setLivroEditando] = useState(null);
const [mensagemAdmin, setMensagemAdmin] = useState({...});
const [syncAtivo, setSyncAtivo] = useState(false);      // Indica sync em tempo real
const [subscription, setSubscription] = useState(null); // Listener de mudanças
```

### Inicialização (useEffect)

```javascript
useEffect(() => {
  // 1. Carrega todos os livros do Supabase
  const { dados } = await lerTodosOsLivros();
  setProdutos(dados);
  
  // 2. Inscreve-se às mudanças em tempo real
  const sub = await inscreverAMudancas(async (payload) => {
    setSyncAtivo(true);
    
    // Recarrega dados quando houver mudança
    const novosDados = await lerTodosOsLivros();
    setProdutos(novosDados.dados);
    
    setSyncAtivo(false);
  });
  
  setSubscription(sub);
  
  // Cleanup ao desmontar
  return () => {
    if (subscription) {
      desinscreverDeMudancas(subscription);
    }
  };
}, []);
```

---

## 🔄 Ciclo Completo CRUD {#ciclo-crud}

### 1️⃣ CREATE - Adicionar novo livro

```
┌─ Usuário clica "Adicionar Novo Livro"
├─ Formulário modal aparece (vazio)
├─ Usuário preenche: título, autor, preço, etc.
├─ Clica "Criar Livro"
├─ handleCriarLivro() chamada
├─ Valida campos obrigatórios
├─ Chama criarLivro(formulario)
├─ Supabase: INSERT INTO produtos VALUES(...)
├─ Dados salvos no banco remoto
├─ Trigger: inscreverAMudancas acionada
├─ App recarrega lista de produtos
├─ UI atualiza em tempo real
└─ Mensagem "Sucesso!" exibida
```

### 2️⃣ READ - Listar/Consultar livros

```
┌─ App inicia ou usuário abre admin
├─ useEffect chamada
├─ lerTodosOsLivros() consultando Supabase
├─ Supabase: SELECT * FROM produtos
├─ Retorna array com todos os livros
├─ setProdutos(dados) atualiza state
├─ UI renderiza cada livro em book-item
└─ Admin panel mostra lista completa
```

### 3️⃣ UPDATE - Editar livro existente

```
┌─ Usuário clica "Editar" em um livro
├─ abrirFormularioEdicao(livro) carrega dados
├─ Formulário modal abre com dados preenchidos
├─ Usuário altera campos desejados
├─ Clica "Atualizar Livro"
├─ handleAtualizarLivro() chamada
├─ Chama atualizarLivro(id, formulario)
├─ Supabase: UPDATE produtos SET ... WHERE id = ?
├─ Dados atualizados no banco remoto
├─ realtime listener dispara
├─ App recarrega lista
└─ UI mostra dados atualizados
```

### 4️⃣ DELETE - Remover livro

```
┌─ Usuário clica "Deletar"
├─ Confirmação solicitada: "Tem certeza?"
├─ Se SIM:
│  ├─ handleDeletarLivro(id) chamada
│  ├─ deletarLivro(id) chamada
│  ├─ Supabase: DELETE FROM produtos WHERE id = ?
│  ├─ Registro removido do banco
│  ├─ realtime listener dispara
│  ├─ App recarrega lista (sem o livro)
│  └─ UI atualiza automaticamente
└─ Se NÃO: operação cancelada
```

---

## ⚡ Sincronização em Tempo Real {#sincronização}

### Como Funciona

```javascript
inscreverAMudancas((payload) => {
  // payload.eventType: "INSERT" || "UPDATE" || "DELETE"
  // payload.new: novo registro (para INSERT/UPDATE)
  // payload.old: registro anterior (para UPDATE/DELETE)
  
  // Recarregar dados para manter tudo sincronizado
  const novosDados = await lerTodosOsLivros();
  setProdutos(novosDados.dados);
});
```

### Fluxo Multi-usuário

```
Usuário A                    Supabase              Usuário B
   │                            │                      │
   ├──────── INSERT livro ──────→│                      │
   │                            ├─── Broadcast ───────→│
   │                            │                      │
   │                       (salvo no DB)   ← lerTodosOsLivros()
   │                            │                      │
   │                            │        setProdutos() │
   │                            │                      │
   │                            │    (Lista atualiza)  │
```

**Resultado:**
- ✅ Ambos os usuários veem a mesma lista
- ✅ Mudanças propagam instantaneamente
- ✅ Sem necessidade de refresh manual
- ✅ UX melhorada e sincronizada

---

## 🚀 Como Usar {#como-usar}

### Passo 1: Abrir Admin Panel

```
1. Clique no botão ⚙️ (canto inferior direito)
2. Modal "Gerenciar Livros" abre
```

### Passo 2: Criar Novo Livro

```
1. Clique "Adicionar Novo Livro"
2. Preencha o formulário:
   - Título * (obrigatório)
   - Autor * (obrigatório)
   - Preço * (obrigatório) - use formato 45.90
   - Categoria (padrão: Ficção)
   - Estoque (quantidade)
   - Descrição (opcional)
   - URL da Imagem (opcional)
3. Clique "Criar Livro"
4. Sucesso! Livro aparece na lista
```

### Passo 3: Editar Livro

```
1. Clique "Editar" no livro desejado
2. Formulário carrega com dados atuais
3. Modifique os campos necessários
4. Clique "Atualizar Livro"
5. Mudanças salvas instantaneamente
```

### Passo 4: Deletar Livro

```
1. Clique "Deletar" no livro desejado
2. Confirme a exclusão
3. Livro removido do banco de dados
4. Lista atualiza automaticamente
```

### Passo 5: Visualizar Listagem

```
1. Admin Panel mostra todos os livros
2. Informações: Título, Autor, Preço, Categoria, Estoque
3. Indicador de sincronização em tempo real (ponto verde)
4. ✅ Quando "aguardando" = aguardando mudanças
5. ✅ Quando "ativa" = sincronizando dados
```

---

## ⚠️ Tratamento de Erros {#erros}

### Validações

```javascript
// 1. Campos obrigatórios
if (!formulario.titulo || !formulario.autor || !formulario.preco) {
  setMensagemAdmin({ 
    tipo: "erro", 
    texto: "Preencha os campos obrigatórios." 
  });
}

// 2. Confirmação antes deletar
if (!confirm("Tem certeza que deseja deletar este livro?")) {
  return; // Cancela operação
}

// 3. Tratamento de erro do Supabase
if (resultado.erro) {
  setMensagemAdmin({ 
    tipo: "erro", 
    texto: resultado.erro 
  });
}
```

### Mensagens de Feedback

```
✅ "Livro criado com sucesso!"      (CREATE)
✅ "Livro atualizado com sucesso!"  (UPDATE)
✅ "Livro deletado com sucesso!"    (DELETE)
❌ "Preencha os campos obrigatórios"
❌ "Erro ao inserir: [mensagem]"
```

---

## 🗄️ Estrutura de Dados (Tabela: produtos)

```sql
CREATE TABLE produtos (
  id                BIGINT PRIMARY KEY,          -- ID única
  titulo            TEXT NOT NULL,               -- Título do livro
  autor             TEXT,                        -- Autor
  preco             DECIMAL(10, 2),              -- Preço em reais
  categoria         TEXT,                        -- Categoria (Ficção, Poesia, etc)
  estoque           INTEGER DEFAULT 0,           -- Quantidade em estoque
  descricao         TEXT,                        -- Descrição
  imagem_url        TEXT,                        -- URL da capa
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data criação
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Data modificação
);
```

---

## 📱 Responsividade

A interface CRUD é totalmente responsiva:

- **Desktop**: Modal com largura máxima 500px, acessível de qualquer lugar
- **Mobile**: Adapta-se ao tamanho da tela, ocupa 90vw máximo
- **Tablet**: Escalável para qualquer tamanho
- **Inputs**: Teclado otimizado para mobile

---

## 🔐 Segurança

Para produção, configure as políticas de Row Level Security (RLS) no Supabase:

```sql
-- Exemplo: Permitir leitura pública, escrita apenas autenticado
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON produtos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated write access"
  ON produtos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

---

## 🧪 Testando o Ciclo CRUD Completo

### Teste 1: CREATE
```
✓ Abrir Admin Panel
✓ Clicar "Adicionar Novo Livro"
✓ Preencher formulário
✓ Clicar "Criar Livro"
✓ Ver mensagem de sucesso
✓ Livro aparece na lista
✓ Abrir Supabase Dashboard → db relacional → produtos → verificar novo registro
```

### Teste 2: READ
```
✓ Admin Panel carrega automaticamente
✓ Lista mostra todos os livros
✓ Cada livro exibe: Título, Autor, Preço, Categoria, Estoque
✓ Botões Editar/Deletar disponíveis
```

### Teste 3: UPDATE
```
✓ Clicar "Editar" em um livro
✓ Formulário carrega com dados atuais
✓ Modificar um ou mais campos
✓ Clicar "Atualizar Livro"
✓ Ver mensagem de sucesso
✓ Lista atualiza com novos dados
✓ Verificar em Supabase Dashboard
```

### Teste 4: DELETE
```
✓ Clicar "Deletar" em um livro
✓ Confirmar exclusão
✓ Ver mensagem de sucesso
✓ Livro desaparece da lista
✓ Verificar em Supabase Dashboard (registro removido)
```

### Teste 5: Real-Time Sync
```
✓ Abrir app em 2 abas do navegador
✓ Na aba 1: criar novo livro
✓ Na aba 2: ver livro aparecer automaticamente
✓ Na aba 2: editar livro
✓ Na aba 1: mudança aparece instantaneamente
✓ Sem necessidade de refresh
```

---

## 🎓 Conceitos Aprendidos

✅ **CRUD Completo**
- Create: Inserir dados
- Read: Consultar dados
- Update: Modificar dados
- Delete: Remover dados

✅ **Arquitetura Híbrida**
- Frontend: React (local)
- Backend: Supabase (nuvem)
- Banco: PostgreSQL (nuvem)

✅ **Sincronização em Tempo Real**
- WebSocket do Supabase
- Event listeners
- Multi-usuário

✅ **Gerenciamento de Estado**
- React hooks (useState, useEffect)
- Formulários controlados
- Validações

✅ **UX Mobile-First**
- Formulários responsivos
- Feedback visual
- Confirmações de ações críticas

---

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Capacitor Docs](https://capacitorjs.com/docs)

---

**Desenvolvido com ❤️ para o aprendizado de Full Stack Development**
