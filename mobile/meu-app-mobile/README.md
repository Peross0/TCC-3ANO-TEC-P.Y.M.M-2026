# ConectaFácil Mobile

Aplicativo Expo para Android, iOS e Web.

## Executar

```bash
npm install
npx expo start
```

## Estrutura

- `app/`: telas e rotas do Expo Router. O grupo `(tabs)` contém as telas da navegação principal.
- `assets/images/`: logos e imagens usados pelo app e pela configuração Expo.
- `components/layout/`: componentes estruturais compartilhados, como o cabeçalho.
- `components/jobs/`: componentes de vagas.
- `components/messages/`: componentes de mensagens.
- `components/modals/`: menus e modais.
- `constants/`: tema e valores compartilhados.
- `context/`: estado compartilhado da sessão.
- `lib/`: acesso à API e armazenamento local.
- `.vscode/` e `.claude/`: configurações locais das ferramentas de desenvolvimento.

As telas continuam dentro de `app/` para preservar as rotas automáticas do Expo Router.
