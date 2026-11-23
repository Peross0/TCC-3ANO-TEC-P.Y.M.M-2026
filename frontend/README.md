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
3. Configure `index.html` como **Error document path**. Isso entrega o shell do
   app quando uma rota não é encontrada, mas o Azure Storage Static Website não
   faz rewrite de SPA e mantém o status HTTP 404 nessa resposta. As rotas são
   exportadas também como arquivos HTML (`home.html`, `login.html` etc.); para
   respostas 200 em URLs sem extensão (`/home`, `/login`) ao abrir ou atualizar
   diretamente, use uma camada de roteamento/rewrite, como Azure Front Door/CDN,
   ou hospede em Azure Static Web Apps. O arquivo `staticwebapp.config.json` não
   configura o Azure Storage.
4. Envie o **conteúdo** de `frontend/dist/` diretamente para o contêiner `$web`.
   Não envie a pasta `dist` como uma subpasta: `index.html`, `_expo/` e `assets/`
   precisam ficar na raiz publicada.

O arquivo `public/staticwebapp.config.json` é específico do Azure Static Web
Apps; o Azure Storage Static Website não usa esse arquivo para roteamento.

## Backend

Defina `EXPO_PUBLIC_API_URL` no ambiente usado para gerar o build, com a URL
pública HTTPS do backend terminada em `/api` (por exemplo,
`https://api.seudominio.com/api`). Essa variável é incorporada ao JavaScript
durante o build; defini-la apenas nas configurações de runtime do Storage não
altera o bundle. Não use credenciais nessa variável. O backend também deve
permitir CORS para a origem pública do site. Sem essa variável, a versão web de
produção não chama `localhost`; as operações que dependem da API exibem um erro
de configuração até que um novo build seja gerado com o endpoint correto.
