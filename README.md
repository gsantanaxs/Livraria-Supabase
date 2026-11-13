# Alfarrábio — Livraria Digital

Aplicativo de livraria para consultar e gerenciar um acervo de livros. O projeto combina uma interface web responsiva com recursos nativos Android usando Capacitor.

## Sobre o aplicativo

O Alfarrábio permite navegar pelo catálogo, consultar livros e categorias e, na área de gestão, cadastrar e editar obras. As informações ficam no Supabase. Capas podem ser escolhidas da galeria ou capturadas pela câmera; os arquivos são enviados ao Supabase Storage e a URL é salva em `produtos.imagem_url`.

O aplicativo também integra autenticação do Supabase, geolocalização e notificações locais para recursos disponíveis na interface.

## Tecnologias

- React 18 e Vite
- Capacitor 8 para Android
- Supabase Auth, Database e Storage
- `@capacitor/camera`, `@capacitor/geolocation` e `@capacitor/local-notifications`
- `@capacitor/assets` para gerar os recursos gráficos Android

## Identidade visual Android

O ícone adaptativo usa fundo marrom e ilustração dourada de um livro aberto. A arte é centralizada para respeitar a área segura dos ícones Android, incluindo as máscaras usadas em aparelhos Samsung. A tela de abertura usa a mesma identidade visual.

| Ícone do aplicativo | Tela de abertura |
| --- | --- |
| <img src="assets/icon.png" alt="Ícone do Alfarrábio: livro aberto dourado sobre fundo marrom" width="220"> | <img src="assets/splash.png" alt="Tela de abertura do Alfarrábio com livro aberto dourado centralizado sobre fundo marrom" width="220"> |

Os arquivos base ficam em `assets/`. As versões Android são geradas em `android/app/src/main/res/`.

## Requisitos

- Node.js 22 e npm
- Android Studio e SDK Android para executar no emulador ou em um aparelho
- Projeto Supabase configurado com as tabelas `produtos` e `categorias`
- Bucket público `user-photos` e políticas de Storage configuradas — veja [SUPABASE_STORAGE.md](./SUPABASE_STORAGE.md)

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Na raiz do projeto, crie `.env.local` com as credenciais públicas do seu projeto Supabase:

   ```dotenv
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
   ```

   Use somente a chave pública `anon`/publishable no frontend. Nunca coloque a chave `service_role` em variáveis `VITE_` ou no repositório. Não publique o arquivo `.env.local`.

3. Inicie a aplicação web:

   ```bash
   npm run dev
   ```

   Abra o endereço indicado pelo Vite, normalmente `http://localhost:5173`.

## Executar no Android

Gere ou atualize os recursos de ícone e splash e sincronize o projeto nativo:

```bash
npx capacitor-assets generate --android
npx cap sync android
```

Abra `android/` no Android Studio para executar no emulador ou conectar um aparelho Samsung com a depuração USB habilitada. Para compilar o frontend web:

```bash
npm run build
```

## Build automático do APK

O workflow do GitHub Actions está em [`android-build.yml`](./.github/workflows/android-build.yml). Ele roda em pushes para `main` ou `master` e também pode ser iniciado manualmente pela aba **Actions** do GitHub. Ao concluir, baixe o artefato `meu-aplicativo-apk` na página da execução.

## Capturas do aplicativo

### Tela do aplicativo

<img src="docs/screenshots/app-preview.png" alt="Prévia da tela inicial do Alfarrábio" width="320">

### Aplicativo em mockups de celular

<p>
  <img src="docs/screenshots/pixel-11-pro-mockup.png" alt="Alfarrábio em um mockup de Google Pixel" width="300">
  <img src="docs/screenshots/iphone-16-hand-mockup.jpeg" alt="Alfarrábio em um mockup de iPhone na mão de uma pessoa" width="420">
</p>

### Ícone na grade de aplicativos Android

<img src="docs/screenshots/app-grid.png" alt="Ícone do Alfarrábio destacado na grade de aplicativos Android" width="320">

As imagens originais fornecidas para a apresentação estão em `docs/screenshots/`. A captura da grade mostra o ícone instalado no Android.

## Documentação relacionada

- [Configuração do Supabase Storage](./SUPABASE_STORAGE.md)
- [Guia de operações CRUD](./CRUD_GUIDE.md)


