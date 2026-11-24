# Testes de Funcionalidade - Toggle "Tenho Interesse"

## Visão Geral
Validação da implementação da funcionalidade de alternância (toggle) do botão "Tenho Interesse" no aplicativo mobile do Conecta Fácil.

## Comportamento Esperado

### 1. Estado Inicial do Botão
- **Esperado**: Botão exibe texto "Tenho interesse"
- **Estilo**: Borda com cor primária, fundo transparente
- **Interatividade**: Habilitado (não desabilitado)

### 2. Ao Clicar em "Tenho Interesse"
- **Ação**: Clique no botão "Tenho interesse" em uma vaga
- **Esperado**:
  - Texto do botão muda para "Processando..."
  - Botão fica desabilitado temporariamente
  - Sistema envia requisição POST para `/candidates/vacancies/{id}/apply`
  - Mensagem de sucesso: "Candidatura enviada - A empresa poderá conversar com você pela aba Mensagens"
  - Texto muda para "Interesse registrado"
  - Estilo do botão muda: fundo fica preenchido com cor primária, texto branco
  - Vaga é adicionada à lista de `appliedVacancyIds`

### 3. Ao Clicar em "Interesse Registrado" (Toggle OFF)
- **Ação**: Clique no botão "Interesse registrado" para remover interesse
- **Esperado**:
  - Texto do botão muda para "Processando..."
  - Botão fica desabilitado temporariamente
  - Sistema envia requisição DELETE para `/candidates/applications/{id}`
  - Mensagem de sucesso: "Interesse removido - Você removeu seu interesse nesta vaga"
  - Texto volta para "Tenho interesse"
  - Estilo do botão volta ao estado original: borda com cor primária, fundo transparente
  - Vaga é removida de `appliedVacancyIds`

### 4. Múltiplas Vagas
- **Esperado**: Cada vaga mantém seu próprio estado de interesse
- **Validação**: Marcar interesse em uma vaga não afeta as demais

### 5. Persistência de Dados
- **Esperado**: Após fechar e abrir o aplicativo, o estado do interesse é mantido
- **Validação**: 
  - Dados são armazenados na tabela `interests` do banco de dados
  - SessionContext carrega as aplicações ao iniciar

### 6. Tratamento de Erros
- **Esperado**: Se houver erro ao marcar/desmarcar:
  - Mensagem de erro é exibida
  - Botão volta ao estado anterior
  - Usuário pode tentar novamente

## Casos de Teste

### Teste 1: Marcar Interesse
1. Abrir aplicativo mobile
2. Navegar para a tela de vagas
3. Visualizar uma vaga
4. Clicar em "Tenho interesse"
5. **Validar**: 
   - Texto muda para "Interesse registrado"
   - Botão fica com fundo preenchido
   - Mensagem de sucesso é exibida
   - Reloading da página mantém o estado

### Teste 2: Desmarcar Interesse
1. Com uma vaga já marcada como "Interesse registrado"
2. Clicar no botão novamente
3. **Validar**:
   - Texto volta para "Tenho interesse"
   - Botão volta ao estado de borda
   - Mensagem de sucesso é exibida
   - Reloading da página confirma a remoção

### Teste 3: Toggle Múltiplas Vezes
1. Marcar interesse em uma vaga
2. Desmarcar interesse
3. Marcar interesse novamente
4. Desmarcar interesse novamente
5. **Validar**: Sistema funciona corretamente em todos os passos

### Teste 4: Persistência após Restart
1. Marcar interesse em 2 vagas
2. Fechar completamente o aplicativo
3. Abrir o aplicativo novamente
4. Navegar para a tela de vagas
5. **Validar**: As 2 vagas ainda mostram "Interesse registrado"

### Teste 5: Isolamento de Estados
1. Marcar interesse em uma vaga (Vaga A)
2. Visualizar outras vagas
3. **Validar**: Apenas Vaga A mostra "Interesse registrado"
4. Desmarcar interesse em Vaga A
5. Marcar interesse em outra vaga (Vaga B)
6. **Validar**: Apenas Vaga B mostra "Interesse registrado"

### Teste 6: Sincronização com Backend
1. Marcar interesse em uma vaga
2. Verificar no banco de dados: `SELECT * FROM interests WHERE user_id = ? AND vacancy_id = ?`
3. **Validar**: Registro existe com `status = "PENDING"`
4. Desmarcar interesse
5. Verificar no banco de dados
6. **Validar**: Registro foi deletado

### Teste 7: Aba de Empresas
1. Marcar interesse em vagas de 2 empresas diferentes
2. Navegar para aba "Empresas"
3. **Validar**: As 2 empresas aparecem na lista
4. Desmarcar interesse em uma das vagas
5. Atualizar a tela de empresas
6. **Validar**: A empresa é removida se não houver mais vagas com interesse

### Teste 8: Tratamento de Erro
1. Simular perda de conexão
2. Tentar marcar interesse em uma vaga
3. **Validar**:
   - Mensagem de erro é exibida
   - Botão continua em estado "Tenho interesse"
   - Usuário pode tentar novamente

## Pontos de Verificação de UI

### Cores e Estilos
- [ ] Botão inativo (padrão): borda com cor primária, fundo transparente
- [ ] Botão ativo (marcado): fundo preenchido com cor primária, texto branco/claro
- [ ] Texto muda dinamicamente entre "Tenho interesse" e "Interesse registrado"
- [ ] Estado "Processando..." é exibido durante a requisição
- [ ] Nenhuma mudança de layout ou espaçamento do componente

### Acessibilidade
- [ ] Label de acessibilidade é atualizada: "Demonstrar interesse" ou "Remover interesse"
- [ ] Estado de acessibilidade reflete o status (selected/disabled)
- [ ] Screen reader funciona corretamente

## Fluxo de Dados Esperado

### Marcar Interesse
```
Usuário clica botão
    ↓
applyToJob(vacancyId) é chamado
    ↓
POST /candidates/vacancies/{id}/apply
    ↓
Backend cria registro em 'interests'
    ↓
Resposta retorna com sucesso
    ↓
State local é atualizado
    ↓
SessionContext é atualizado
    ↓
Componente é re-renderizado
    ↓
UI mostra "Interesse registrado" com estilo ativo
```

### Desmarcar Interesse
```
Usuário clica botão (já marcado)
    ↓
applyToJob(vacancyId) verifica isCurrentlyApplied
    ↓
DELETE /candidates/applications/{id}
    ↓
Backend deleta registro em 'interests'
    ↓
Resposta retorna com sucesso
    ↓
State local é atualizado
    ↓
SessionContext é atualizado
    ↓
Componente é re-renderizado
    ↓
UI mostra "Tenho interesse" com estilo inativo
```

## Checklist Final

### Backend (via Postman/API)
- [ ] POST `/candidates/vacancies/{id}/apply` cria registro em `interests`
- [ ] DELETE `/candidates/applications/{id}` remove registro de `interests`
- [ ] Registros persistem no banco de dados
- [ ] Validação de conflito único (não pode aplicar 2 vezes a mesma vaga)

### Mobile
- [ ] Botão alterna entre estado ativo/inativo
- [ ] Texto do botão muda corretamente
- [ ] Cor e estilo do botão mudam conforme esperado
- [ ] Mensagens de sucesso e erro são exibidas
- [ ] Estado persiste após refresh da página
- [ ] Estado persiste após restart do app
- [ ] Múltiplas vagas mantêm estado independente
- [ ] Sem alteração de layout ou comportamento de outras funcionalidades

## Notas
- A implementação utiliza a rota existente DELETE `/candidates/applications/{vacancyId}`
- Não foi necessário criar novas rotas no backend
- O estado é gerenciado no React (home.js) e SessionContext
- Dados são persistidos automaticamente no banco de dados pelo backend
