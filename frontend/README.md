# Publicação do frontend no Azure Static Web Apps

O frontend usa Expo SDK 54 e Expo Router com exportação web estática.

## Build local

Na pasta `frontend`:

```bash
npm ci
npm run build
```

O comando gera o site em `dist/`. As páginas, bundles, imagens, fontes e o
`staticwebapp.config.json` são incluídos nessa pasta.

## Configuração do Azure Static Web Apps

Use estas configurações para o frontend:

- Localização do aplicativo: `frontend`
- Localização da API do Azure Static Web Apps: vazia (a API atual é um backend
  separado)
- Comando de build: `npm run build`
- Localização da saída: `dist`

O arquivo `public/staticwebapp.config.json` é copiado para a raiz da saída pelo
Expo. Ele faz o fallback das rotas do Expo Router para `index.html`, mantendo
arquivos estáticos ausentes fora desse fallback.

## Backend

Defina `EXPO_PUBLIC_API_URL` no ambiente do workflow de build com a URL pública
do backend terminada em `/api` (por exemplo, `https://api.exemplo.com/api`).
Essa variável é incorporada ao JavaScript durante o build; defini-la apenas nas
configurações de runtime do Azure não altera o bundle já gerado. Não use
credenciais nessa variável. O backend também deve aceitar requisições CORS da
origem pública do Static Web App e estar disponível por HTTPS.
