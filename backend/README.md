# Backend ConectaFacil

Backend unico do projeto, com Express, JWT, SQLite nativo do Node 24 e Knex.

## Executar

```powershell
npm install
npm run migrate:latest
npm run seed # somente para criar/recriar os dados de demonstração
npm start
```

A API fica em `http://localhost:3000`.
As migrations são verificadas ao iniciar o backend; os seeds não são executados automaticamente para evitar recriar contas e apagar dados relacionados a vagas de demonstração a cada reinicialização. Em desenvolvimento, execute `npm run seed` manualmente apenas quando quiser repor os dados de teste.

Para enviar e-mails de recuperação de senha, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM` no `.env`. Sem SMTP, o ambiente de desenvolvimento registra no terminal que o e-mail não foi enviado e mostra o código apenas para testes locais. Em outros ambientes, a ausência ou falha do SMTP invalida o código emitido; a API mantém a mesma resposta genérica para não revelar se o e-mail está cadastrado.

## Cadastro

O cadastro cria a conta e inicia a sessão imediatamente; a confirmação de e-mail não é exigida. A recuperação de senha continua usando código temporário enviado por e-mail.

## Testes

```powershell
npm run test:smoke
```

## Rotas principais

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/messages` (mensagens vinculadas a candidaturas)
- `GET/PUT /api/recruiters/profile`
- `PUT /api/recruiters/company` (atualiza nome, segmento e localização em todas as vagas não removidas do recrutador)
- `POST /api/recruiters/company/logo` (envia `company_logo` em multipart/form-data)
- `GET/POST/PUT/DELETE /api/recruiters/vacancies`
- `GET/POST /api/candidates/vacancies`

## Contas de teste (desenvolvimento)

Após executar `npm run seed`, use:

- Administrador: `admin@admin.com` / `Senha123!`
- Candidato: `candidate@test.com` / `Senha123!`

As mensagens só podem ser trocadas entre o candidato e o recrutador de uma candidatura existente.

O banco de desenvolvimento fica em `data/conectafacil.db`, criado pelas migrations. O codigo antigo foi mantido em `legacy` apenas como referencia.
