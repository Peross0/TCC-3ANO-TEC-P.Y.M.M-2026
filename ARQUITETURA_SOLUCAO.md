# Arquitetura da Solução - Toggle "Tenho Interesse"

## 🏗️ Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────────────┐
│                        APLICATIVO MOBILE (React Native)             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    HomeScreen (home.js)                    │    │
│  │                                                            │    │
│  │  - applyToJob(vacancyId)                                  │    │
│  │    └─→ Lógica de toggle                                  │    │
│  │    └─→ POST ou DELETE baseado em estado                 │    │
│  │                                                            │    │
│  │  - appliedVacancyIdSet (Set de vagas aplicadas)          │    │
│  │  - applyingToJob (ID vaga sendo processada)              │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                           │                                        │
│                           ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                 JobCard (JobCard.js)                       │    │
│  │                                                            │    │
│  │  Props:                                                   │    │
│  │  - isApplied: boolean                                     │    │
│  │  - isApplying: boolean                                    │    │
│  │  - onApply: (vacancyId) => void                           │    │
│  │                                                            │    │
│  │  Renderiza:                                               │    │
│  │  - Botão "Tenho interesse" / "Interesse registrado"      │    │
│  │  - Visual dinâmico (ativo/inativo)                        │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                           │                                        │
│                           ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │            SessionContext (gerenciador de estado)         │    │
│  │                                                            │    │
│  │  - sessionData.applications (lista de aplicações)         │    │
│  │  - setSessionData(newData)                                │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                           │                                        │
│                           ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                  apiFetch (HTTP Client)                    │    │
│  │                                                            │    │
│  │  Requisições HTTP:                                        │    │
│  │  - POST /candidates/vacancies/{id}/apply                 │    │
│  │  - DELETE /candidates/applications/{id}                  │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP (REST API)
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
     ┌────────────────────────────────────────────────────┐
     │              BACKEND (Express.js / Node)          │
     ├────────────────────────────────────────────────────┤
     │                                                    │
     │  ┌──────────────────────────────────────────┐    │
     │  │   Routes (/candidates/vacancies)        │    │
     │  │                                          │    │
     │  │  POST   /vacancies/:id/apply             │    │
     │  │  DELETE /applications/:vacancyId         │    │
     │  │                                          │    │
     │  └──────────────────────────────────────────┘    │
     │               │               │                 │
     │               ▼               ▼                 │
     │  ┌──────────────────────────────────────────┐    │
     │  │   Controllers (candidateController)      │    │
     │  │                                          │    │
     │  │  - applyToVacancy()                      │    │
     │  │  - deleteApplication()                   │    │
     │  │                                          │    │
     │  └──────────────────────────────────────────┘    │
     │               │               │                 │
     │               ▼               ▼                 │
     │  ┌──────────────────────────────────────────┐    │
     │  │   Services (candidateService)            │    │
     │  │                                          │    │
     │  │  - applyToVacancy(userId, vacancyId)    │    │
     │  │    └─→ INSERT INTO interests             │    │
     │  │                                          │    │
     │  │  - deleteApplication(userId, vacancyId) │    │
     │  │    └─→ DELETE FROM interests             │    │
     │  │                                          │    │
     │  └──────────────────────────────────────────┘    │
     │               │               │                 │
     │               ▼               ▼                 │
     │  ┌──────────────────────────────────────────┐    │
     │  │   Database Query (Knex.js)               │    │
     │  │                                          │    │
     │  │  - knex('interests').insert(...)         │    │
     │  │  - knex('interests').delete(...)         │    │
     │  │                                          │    │
     │  └──────────────────────────────────────────┘    │
     │               │               │                 │
     └───────────────┼───────────────┼─────────────────┘
                     │               │
                     ▼               ▼
        ┌──────────────────────────────────────┐
        │      Banco de Dados (SQLite)         │
        ├──────────────────────────────────────┤
        │  Tabela: interests                   │
        │  ┌────────────────────────────────┐  │
        │  │ id (PK)                        │  │
        │  │ user_id (FK → users)           │  │
        │  │ vacancy_id (FK → vacancies)    │  │
        │  │ status (PENDING/APPROVED/...)  │  │
        │  │ origin (MOBILE/WEB)            │  │
        │  │ created_at (timestamp)         │  │
        │  │ updated_at (timestamp)         │  │
        │  └────────────────────────────────┘  │
        │                                      │
        │  Unique Constraint:                  │
        │  (user_id, vacancy_id)              │
        └──────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados - Marcar Interesse

```
┌────────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO CLICA NO BOTÃO "TENHO INTERESSE"                   │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. JobCard.onApply() é chamado com vacancyId                  │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. applyToJob(vacancyId) executada em home.js                │
│    - Verifica: isCurrentlyApplied = false                      │
│    - Define: setApplyingToJob(vacancyId)                      │
│    - UI: Botão desabilitado, texto "Processando..."           │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. POST /candidates/vacancies/{id}/apply enviado              │
│    - Header: Authorization: Bearer {token}                     │
│    - Method: POST                                              │
│    - Endpoint: /api/candidates/vacancies/123/apply            │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. Backend: applyToVacancy(userId, vacancyId)                 │
│    - Valida vaga existe e está aberta                          │
│    - Verifica se usuário já aplicou (409 Conflict)             │
│    - INSERT INTO interests {...}                              │
│    - Resposta: 201 { message, application }                   │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 6. Frontend recebe resposta com sucesso                       │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 7. Estados são atualizados em home.js                         │
│    - setAppliedVacancyIds([...current, vacancyId])            │
│    - setSessionData({ ...current, applications: [...] })      │
│    - setApplyingToJob(null)                                   │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 8. JobCard re-renderiza com novo estado                       │
│    - isApplied = true                                          │
│    - Botão mostra "Interesse registrado"                       │
│    - Estilo muda para fundo preenchido                        │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 9. Alert exibido: "Candidatura enviada"                       │
│    "A empresa poderá conversar com você pela aba Mensagens"   │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados - Desmarcar Interesse

```
┌────────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO CLICA NO BOTÃO "INTERESSE REGISTRADO"              │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. JobCard.onApply() é chamado com vacancyId                  │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. applyToJob(vacancyId) executada em home.js                │
│    - Verifica: isCurrentlyApplied = true ✅                    │
│    - Define: setApplyingToJob(vacancyId)                      │
│    - UI: Botão desabilitado, texto "Processando..."           │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. DELETE /candidates/applications/{id} enviado               │
│    - Header: Authorization: Bearer {token}                     │
│    - Method: DELETE                                            │
│    - Endpoint: /api/candidates/applications/123               │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. Backend: deleteApplication(userId, vacancyId)              │
│    - Valida candidatura existe                                │
│    - DELETE FROM interests WHERE user_id=? AND vacancy_id=?   │
│    - Resposta: 200 { message }                                │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 6. Frontend recebe resposta com sucesso                       │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 7. Estados são atualizados em home.js                         │
│    - setAppliedVacancyIds(current.filter(...))                │
│    - setSessionData({ ...current, applications: [...] })      │
│    - setApplyingToJob(null)                                   │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 8. JobCard re-renderiza com novo estado                       │
│    - isApplied = false                                         │
│    - Botão mostra "Tenho interesse"                            │
│    - Estilo volta ao transparente                             │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ 9. Alert exibido: "Interesse removido"                        │
│    "Você removeu seu interesse nesta vaga"                    │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparação: Antes vs Depois

### ANTES (Sem Toggle)
```
Usuário clica "Tenho interesse"
            ↓
Envia POST /apply
            ↓
Botão fica DESABILITADO permanentemente ❌
            ↓
Usuário NÃO pode desmarcar ❌
            ↓
Precisa contactar suporte para remover ❌
```

### DEPOIS (Com Toggle)
```
Usuário clica "Tenho interesse"
            ↓
Envia POST /apply
            ↓
Botão muda para "Interesse registrado" ✅
            ↓
Usuário pode clicar novamente ✅
            ↓
Envia DELETE /applications ✅
            ↓
Botão volta para "Tenho interesse" ✅
            ↓
Pode repetir quantas vezes quiser ✅
```

---

## 🔐 Fluxo de Autenticação

```
┌──────────────────────────┐
│   Login do Usuário       │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│   Backend retorna JWT    │
│   - user_id              │
│   - user_type: CANDIDATE │
│   - token: "..."         │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│   Salvo em SecureStore   │
│   (expo-secure-store)    │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│   SessionContext         │
│   armazena sessionData   │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│   Cada requisição HTTP   │
│   - Header autorization: │
│     Bearer {token}       │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│   Backend valida JWT     │
│   - Extrai user_id       │
│   - Usa em applyToJob()  │
└──────────────────────────┘
```

---

## 🗄️ Estrutura de Dados - Tabela Interests

```sql
CREATE TABLE interests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  vacancy_id INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED
  origin TEXT DEFAULT 'MOBILE',   -- MOBILE, WEB, ADMIN
  created_at TEXT NOT NULL,       -- ISO 8601 timestamp
  updated_at TEXT NOT NULL,       -- ISO 8601 timestamp
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vacancy_id) REFERENCES vacancies(id),
  
  -- Garante que usuário não aplica 2x a mesma vaga
  UNIQUE(user_id, vacancy_id)
);

-- Índices para performance
CREATE INDEX idx_interests_user_id ON interests(user_id);
CREATE INDEX idx_interests_vacancy_id ON interests(vacancy_id);
CREATE INDEX idx_interests_status ON interests(status);
```

---

## 🔄 Estados do Aplicativo

### SessionContext.sessionData
```javascript
{
  user: {
    id: 123,
    email: "user@example.com",
    user_type: "CANDIDATE",
    full_name: "João Silva",
    ...
  },
  applications: [
    {
      id: 1,
      vacancy_id: 456,
      job_title: "Desenvolvedor React",
      company_name: "Tech Corp",
      status: "PENDING",
      applied_at: "2026-11-24T10:30:00Z",
      ...
    },
    // ... mais aplicações
  ],
  favoriteVacancyIds: ["789", "790", ...],
  ...
}
```

### HomeScreen Local State
```javascript
{
  appliedVacancyIds: ["456", "789"],           // Array de IDs
  applyingToJob: "456" || null,                // ID processando
  savingFavoriteIds: ["789", ...],             // Array de IDs
  jobs: [                                      // Array de vagas
    {
      vacancyId: 456,
      company: "Tech Corp",
      title: "Desenvolvedor React",
      description: "...",
      ...
    }
  ],
  ...
}
```

---

## 🚀 Fluxo de Inicialização

```
1. App abre
        │
        ▼
2. AuthMiddleware carrega token de SecureStore
        │
        ▼
3. SessionContext.useEffect() executa
   - GET /candidates/profile
   - GET /candidates/applications
   - GET /candidates/favorites
        │
        ▼
4. HomeScreen.useEffect() carrega vagas
   - GET /candidates/vacancies
   - Popula jobs[]
        │
        ▼
5. Home renderiza JobCards
   - isApplied baseado em appliedVacancyIdSet
   - appliedVacancyIdSet construído a partir de applications[]
        │
        ▼
6. Botões mostram estado correto
   - Se vacancy em applications[] → "Interesse registrado"
   - Se vacancy não em applications[] → "Tenho interesse"
```

---

## 💾 Persistência de Dados

```
┌──────────────────────────────────────────────────────┐
│                  CAMADAS DE PERSISTÊNCIA             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. SESSÃO (RAM)                                     │
│     - Carregado na inicialização                    │
│     - appliedVacancyIds[], sessionData.applications │
│     - Perdido ao fechar app                         │
│                                                      │
│  2. BANCO DE DADOS (SQLite no servidor)             │
│     - Tabela interests                              │
│     - Persiste entre sessões                        │
│     - Autorizado e validado                         │
│                                                      │
│  3. SINCRONIZAÇÃO                                    │
│     - POST /apply → INSERT no banco                │
│     - DELETE /applications → DELETE do banco        │
│     - GET /applications → Carrega no SessionContext │
│                                                      │
└──────────────────────────────────────────────────────┘

Fluxo de Persistência:
1. Usuário marca interesse
2. POST envia ao backend
3. Backend registra em banco de dados
4. Frontend atualiza estado local
5. App fecha
6. App abre novamente
7. GET /applications carrega do banco
8. Frontend recupera estado
9. Botão mostra "Interesse registrado"
```

---

## 🎯 Componentes Críticos

### 1. **JobCard.js**
- Responsável pelo visual do botão
- Recebe props: isApplied, isApplying, onApply
- Renderiza texto dinâmico e estilos

### 2. **home.js - applyToJob()**
- Coração da lógica de toggle
- Detecta estado atual (isCurrentlyApplied)
- Envia POST ou DELETE baseado em estado
- Atualiza aplicações com state

### 3. **SessionContext.js**
- Gerencia sessionData globalmente
- Carrega aplicações ao iniciar
- Sincroniza com backend

### 4. **Backend - candidateService.js**
- applyToVacancy(): INSERT em interests
- deleteApplication(): DELETE de interests
- Ambos validam permissões e dados

### 5. **Banco de Dados**
- Tabela interests com unique constraint
- Garante dados consistentes
- Auditoria de criação/atualização

---

**Versão**: 1.0  
**Data**: 2026-11-24  
**Status**: ✅ Implementado e Testado
