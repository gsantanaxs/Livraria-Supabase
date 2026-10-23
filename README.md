# Livraria-Supabase

Aplicação de livraria feita com React, Vite, Capacitor e Supabase. Os livros e as categorias ficam no banco de dados do Supabase; as capas são armazenadas no Supabase Storage e o endereço público é salvo em `produtos.imagem_url`.

## Requisitos

- Node.js e npm instalados.
- Um projeto Supabase com as tabelas `produtos` e `categorias`.
- Um bucket público `user-photos` e as políticas de Storage configuradas. Consulte [SUPABASE_STORAGE.md](./SUPABASE_STORAGE.md).

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo de ambiente local a partir do modelo:

   **Windows PowerShell:**

   ```powershell
   Copy-Item .env.example .env.local
   ```

   **macOS/Linux:**

   ```bash
   cp .env.example .env.local
   ```

3. No painel Supabase, abra as configurações do projeto e copie a URL do projeto e a chave pública (publishable/anon) para `.env.local`:

   ```dotenv
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
   ```

   Substitua os valores de exemplo pelos dados reais do seu projeto. Nunca coloque a chave `service_role` em arquivos usados pelo frontend ou em variáveis `VITE_`.

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Abra no navegador o endereço mostrado no terminal (normalmente `http://localhost:5173`).

O Vite lê as variáveis `VITE_` na inicialização. Reinicie o servidor depois de editar `.env.local`.

## Criar um livro com foto

1. Faça login no aplicativo.
2. Abra o botão de gerenciamento (⚙️) e selecione **Adicionar Novo Livro**.
3. Preencha os dados, escolha uma categoria e selecione **Adicionar foto da galeria** ou **Tirar foto**.
4. Clique em **Criar Livro**. A foto será enviada ao bucket `user-photos` e sua URL será salva na coluna `imagem_url` do produto.

Para configurar o bucket e as políticas necessárias, siga [SUPABASE_STORAGE.md](./SUPABASE_STORAGE.md).

## Proteção de variáveis de ambiente

- `.env.example` é um modelo: mantenha nele apenas nomes de variáveis e valores fictícios.
- Coloque credenciais reais somente em `.env.local`. Esse arquivo é ignorado pelo Git pelo `.gitignore`.
- Não copie chaves, tokens, senhas ou URLs com credenciais para o código, README, commits ou issues.
- A chave pública publishable/anon pode ser usada no frontend com as políticas de acesso (RLS) corretas. A chave `service_role` é secreta e nunca deve ser exposta ao navegador.
- Antes de enviar alterações, confira `git status` e verifique que `.env.local` não está entre os arquivos staged ou no commit.

## Build de produção

```bash
npm run build
```

Os arquivos gerados ficam em `dist/`.
