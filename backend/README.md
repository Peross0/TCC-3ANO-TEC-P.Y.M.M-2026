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

O envio de e-mails não está disponível.

## Documentos do perfil

Os endpoints autenticados `GET/POST /api/users/me/documents` e `GET/DELETE /api/users/me/documents/:documentId` permitem listar, anexar, baixar e excluir arquivos de qualquer formato. O envio usa o campo multipart `document`; o limite padrão é 25 MB por arquivo (`MAX_DOCUMENT_MB`). Os arquivos ficam fora do diretório público em `DOCUMENT_UPLOAD_DIR` (padrão `./uploads/documents`); em produção, monte esse caminho em armazenamento persistente e faça backup conforme a política do serviço.

## Cadastro

O cadastro cria a conta e inicia a sessão imediatamente. Web e mobile usam os mesmos endpoints e os papéis `CANDIDATE` e `RECRUITER`. O CPF continua obrigatório para candidato; CNPJ é opcional para recrutador, e, quando informado, é validado no servidor. Usuários autenticados podem alterar a senha nas configurações.

O perfil empresarial canônico é mantido em `users` (`company_name`, descrição, segmento e localização). A migration `20261126000020_add_recruiter_company_profile.js` adiciona os campos que faltavam, preenche valores a partir da vaga mais recente sem substituir valores existentes e permite empresas sem documento fiscal. Ela reconstrói `users` no SQLite preservando as linhas, índices, trigger e referências; seu rollback recusa a operação enquanto houver empresas sem documento fiscal.

A migration `20261126000021_make_recruiter_tax_id_optional.js` atualiza bancos que já haviam aplicado a migration anterior, mas ainda exigiam documento fiscal para recrutadores. Ela preserva os dados existentes e também recusa o rollback enquanto houver empresas sem documento fiscal.

A recuperação sem sessão está disponível somente fora de produção (`NODE_ENV=development` ou `test`). **É insegura:** qualquer pessoa que conheça um e-mail cadastrado pode assumir a conta. Não use dados reais nem exponha esse backend a redes não confiáveis. Em produção a rota não existe. A redefinição revoga as sessões anteriores. A alteração nas configurações continua exigindo sessão válida.

## Testes

```powershell
npm run test:smoke
npm run test:migration:company-profile
```

O teste de migration cria e remove uma base SQLite temporária; não usa o banco de desenvolvimento.

## Rotas principais

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/messages` (mensagens vinculadas a candidaturas)
- `GET/PUT /api/recruiters/profile`
- `PUT /api/recruiters/company` (atualiza o perfil empresarial e sincroniza nome, descrição, segmento e localização nas vagas não removidas)
- `POST /api/recruiters/company/logo` (envia `company_logo` em multipart/form-data)
- `GET/POST/PUT/DELETE /api/recruiters/vacancies`
- `GET/POST /api/candidates/vacancies`

## Contas de teste (desenvolvimento)

Após executar `npm run seed`, use:

- Administrador: `admin@admin.com` / `Senha123!`
- Candidato: `candidate@test.com` / `Senha123!`

As mensagens só podem ser trocadas entre o candidato e o recrutador de uma candidatura existente.

O banco de desenvolvimento fica em `data/conectafacil.db`, criado pelas migrations. O codigo antigo foi mantido em `legacy` apenas como referencia.
