# Configuração do Supabase Storage para fotos

O banco de dados guarda dados estruturados (por exemplo, livros e usuários). O Storage guarda os arquivos binários das fotos; a aplicação salva o arquivo no Storage e usa a URL pública para exibi-lo.

## 1. Criar o bucket

No painel do Supabase, abra **Storage → New bucket**:

- Nome: `user-photos` (o nome deve corresponder ao código).
- Marque **Public bucket** para que a URL da foto possa ser exibida sem uma sessão.

O bucket público permite leitura pública dos arquivos, mas não libera uploads. As políticas abaixo limitam uploads e listagem a usuários autenticados, em uma pasta com o ID de cada usuário.

## 2. Criar políticas de acesso

Abra o **SQL Editor** no Supabase e execute:

```sql
create policy "Authenticated users can upload their own photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Authenticated users can list their own photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'user-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
```

Como o bucket é público, o `SELECT` acima restringe operações autenticadas de listagem; a leitura direta dos arquivos continua pública, conforme a configuração do bucket. Não crie uma política `INSERT` para `anon`.

## 3. Configurar e executar o aplicativo

O projeto já usa `@supabase/supabase-js`. Configure as variáveis locais no `.env.local` (não publique nem versione esse arquivo):

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

Reinicie o servidor Vite depois de alterar as variáveis. Entre no aplicativo, permita o acesso à câmera/galeria e capture uma foto. O app converte a URI retornada pelo Capacitor em `Blob`, envia o arquivo para `user-photos/<id-do-usuario>/` e renderiza a URL pública retornada pelo Supabase.

As chaves `anon`/publishable são destinadas ao cliente. Nunca coloque a `service_role` no React ou em variáveis `VITE_`.
