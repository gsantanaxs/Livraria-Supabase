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

## Capturas de tela para a entrega

As imagens acima mostram o ícone e a tela de abertura. Para completar a entrega no Google Classroom, acrescente também uma captura real do app aberto e outra da grade de aplicativos do seu Samsung (ou emulador). Salve as imagens em `docs/screenshots/` e insira-as nesta seção, por exemplo:

```markdown
![Tela inicial do Alfarrábio em um Samsung](docs/screenshots/tela-inicial-samsung.png)
![Alfarrábio na grade de aplicativos](docs/screenshots/grade-apps-samsung.png)
```

Use capturas feitas no dispositivo/emulador, sem credenciais ou dados pessoais visíveis.

## Entrega no Google Classroom

- Envie o projeto atualizado ou o link do repositório GitHub.
- Confirme que o workflow terminou com sucesso e inclua o APK gerado, se solicitado.
- Inclua as capturas reais do Samsung/emulador no README e no material de entrega.

## Documentação relacionada

- [Configuração do Supabase Storage](./SUPABASE_STORAGE.md)
- [Guia de operações CRUD](./CRUD_GUIDE.md)

