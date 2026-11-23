# Publicação do frontend no Azure Storage Static Website

O frontend usa Expo SDK 54, Expo Router e exportação web estática.

## Build de produção

Na pasta `frontend`:

```bash
npm ci
npm run build
```

O build gera os arquivos em `dist/`. O `index.html`, o bundle JavaScript, os
estilos e os recursos usados pelo app ficam nessa pasta.

## Publicação no Azure Storage

1. Ative **Static website** na conta de Storage.
2. Configure `index.html` como **Index document name**.
3. Configure `index.html` como **Error document path** para que rotas do Expo
   Router, como `/home` e `/login`, carreguem a aplicação no acesso direto ou
   após atualizar a página.
4. Envie o **conteúdo** de `frontend/dist/` diretamente para o contêiner `$web`.
   Não envie a pasta `dist` como uma subpasta: `index.html`, `_expo/` e `assets/`
   precisam ficar na raiz publicada.

O arquivo `public/staticwebapp.config.json` é específico do Azure Static Web
Apps; o Azure Storage Static Website não usa esse arquivo para roteamento.

## Backend

Defina `EXPO_PUBLIC_API_URL` no ambiente usado para gerar o build, com a URL
pública HTTPS do backend terminada em `/api`. Essa variável é incorporada ao
JavaScript durante o build; defini-la apenas nas configurações de runtime do
Storage não altera o bundle. Não use credenciais nessa variável. O backend
também deve permitir CORS para a origem pública do site.
