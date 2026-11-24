# Guia Rápido de Teste Manual - Toggle "Tenho Interesse"

## ⚡ Teste Rápido (5 minutos)

### Pré-requisitos
- [ ] App mobile compilado e rodando
- [ ] Usuário logado como CANDIDATE
- [ ] Conexão com internet/backend funcionando
- [ ] Pelo menos 1 vaga aberta no sistema

### Passo 1: Marcar Interesse
1. Abrir tela de Vagas (home.js)
2. Encontrar uma vaga disponível
3. **Clique** no botão "Tenho interesse"
4. **Verificar**:
   - [ ] Texto muda para "Processando..." (brevemente)
   - [ ] Botão fica desabilitado enquanto processa
   - [ ] Texto muda para "Interesse registrado"
   - [ ] Fundo do botão muda para cor primária (preenchido)
   - [ ] Texto do botão muda para cor clara
   - [ ] Alerta de sucesso: "Candidatura enviada"
   - [ ] Mensagem: "A empresa poderá conversar com você pela aba Mensagens"

### Passo 2: Desmarcar Interesse
1. Com a vaga ainda na tela, **clique** no botão "Interesse registrado"
2. **Verificar**:
   - [ ] Texto muda para "Processando..." (brevemente)
   - [ ] Botão fica desabilitado enquanto processa
   - [ ] Texto volta para "Tenho interesse"
   - [ ] Fundo do botão volta ao transparente
   - [ ] Texto do botão volta à cor primária
   - [ ] Alerta de sucesso: "Interesse removido"
   - [ ] Mensagem: "Você removeu seu interesse nesta vaga"

### Passo 3: Toggle Novamente
1. **Clique** no botão "Tenho interesse" novamente
2. **Verificar**:
   - [ ] Funciona normalmente (marca interesse novamente)
   - [ ] Mesmo comportamento do Passo 1

### Passo 4: Atualizar Página
1. Com a vaga marcada, **scroll** para cima e para baixo para recarregar lista
2. **Verificar**:
   - [ ] Vaga continua mostrando "Interesse registrado"
   - [ ] Estado foi preservado

### Passo 5: Fechar e Abrir App
1. **Feche** o app completamente
2. **Aguarde** 2-3 segundos
3. **Abra** o app novamente
4. **Navegue** para a tela de Vagas
5. **Verificar**:
   - [ ] Vaga continua mostrando "Interesse registrado"
   - [ ] Estado foi persistido no banco de dados

---

## 🧪 Teste de Múltiplas Vagas

### Passo 1: Marcar em Vaga A
1. Abrir tela de Vagas
2. Encontrar Vaga A
3. Clicar em "Tenho interesse"
4. **Verificar**: Mudar para "Interesse registrado"

### Passo 2: Marcar em Vaga B
1. Scroll para encontrar Vaga B (diferente de A)
2. Clicar em "Tenho interesse"
3. **Verificar**: Mudar para "Interesse registrado"

### Passo 3: Verificar Isolamento
1. Scroll de volta para Vaga A
2. **Verificar**: Vaga A ainda mostra "Interesse registrado"
3. Scroll para Vaga B
4. **Verificar**: Vaga B ainda mostra "Interesse registrado"

### Passo 4: Desmarcar Vaga A
1. Scroll para Vaga A
2. Clicar em "Interesse registrado"
3. **Verificar**: 
   - [ ] Vaga A volta para "Tenho interesse"
   - [ ] Scroll para Vaga B
   - [ ] Vaga B ainda mostra "Interesse registrado" ✅

---

## ❌ Teste de Erro (Desligar Conexão)

### Pré-requisitos
- [ ] App rodando
- [ ] Usuário pode desligar/ligar conexão de internet

### Passo 1: Desligar Internet
1. Desabilitar WiFi/Dados móveis do celular
2. App deve exibir erro de conexão

### Passo 2: Tentar Marcar Interesse
1. Clicar em "Tenho interesse"
2. **Verificar**:
   - [ ] Texto muda para "Processando..." 
   - [ ] Aguarda e mostra erro: "Não foi possível se candidatar"
   - [ ] Mensagem de erro de conexão
   - [ ] Botão volta para "Tenho interesse"

### Passo 3: Ligar Internet
1. Reabilitar WiFi/Dados móveis
2. Tentar marcar interesse novamente
3. **Verificar**: Funciona normalmente

---

## 🔄 Teste de Concorrência (Múltiplos Cliques)

### Passo 1: Cliques Rápidos
1. Abrir tela de Vagas
2. Encontrar uma vaga
3. Clique rápido 2-3 vezes no botão "Tenho interesse"
4. **Verificar**:
   - [ ] Sistema não envia múltiplas requisições
   - [ ] Botão fica desabilitado enquanto processa
   - [ ] Apenas 1 candidatura é enviada
   - [ ] Resultado final correto

---

## 📱 Teste com Diferentes Temas

### Teste com Tema Escuro
1. Abrir Configurações
2. Mudar para Tema Escuro
3. Voltar para Vagas
4. **Verificar**:
   - [ ] Botão inativo: borda visível, fundo escuro transparente
   - [ ] Botão ativo: fundo preenchido, legível com tema escuro
   - [ ] Texto legível em ambos estados

### Teste com Alto Contraste
1. Abrir Configurações
2. Ativar Alto Contraste
3. Voltar para Vagas
4. **Verificar**:
   - [ ] Botão inativo: borda mais grossa, bem definida
   - [ ] Botão ativo: contraste suficiente, bem legível
   - [ ] Sem problemas de visibilidade

### Teste com Texto Grande
1. Abrir Configurações
2. Ativar Texto Grande
3. Voltar para Vagas
4. **Verificar**:
   - [ ] Texto do botão aumenta proporcionalmente
   - [ ] Botão se adapta ao tamanho maior
   - [ ] Layout não quebra

---

## 🌐 Teste com Backend (SQL)

### Verificar Dados no Banco

**Antes de Marcar Interesse**:
```sql
SELECT * FROM interests 
WHERE user_id = ? AND vacancy_id = ?;
-- Resultado: Nenhum registro
```

**Depois de Marcar Interesse**:
```sql
SELECT * FROM interests 
WHERE user_id = ? AND vacancy_id = ?;
-- Resultado: 1 registro com status = "PENDING"
```

**Depois de Desmarcar Interesse**:
```sql
SELECT * FROM interests 
WHERE user_id = ? AND vacancy_id = ?;
-- Resultado: Nenhum registro
```

---

## 📋 Checklist de Validação

### Funcionalidade
- [ ] Botão marca interesse (POST funciona)
- [ ] Botão desmarca interesse (DELETE funciona)
- [ ] Pode repetir quantas vezes quiser
- [ ] Estado persiste após refresh
- [ ] Estado persiste após restart
- [ ] Múltiplas vagas isoladas

### Visual
- [ ] Texto muda dinamicamente
- [ ] Cores mudam conforme esperado
- [ ] Sem quebra de layout
- [ ] Funciona em tema claro/escuro
- [ ] Alto contraste funciona
- [ ] Texto grande funciona

### Acessibilidade
- [ ] Label de acessibilidade é dinâmica
- [ ] Screen reader funciona
- [ ] Estado é acessível (selected/disabled)

### Erros
- [ ] Mensagem de erro quando falha
- [ ] Botão volta ao estado anterior
- [ ] Pode tentar novamente

### Performance
- [ ] Sem lag ao clicar
- [ ] Sem múltiplas requisições
- [ ] Resposta rápida do servidor

---

## 🐛 Se Algo Estiver Errado

### Botão não muda de estado
1. Verificar se sessionData está sendo atualizado
2. Verificar console para erros
3. Verificar se apiFetch está funcionando
4. Testar com Postman/API diretamente

### Estado não persiste
1. Verificar banco de dados (registro existe?)
2. Verificar se SessionContext carrega dados ao iniciar
3. Verificar se apiFetch retorna sucesso

### Erros de conexão
1. Verificar se backend está rodando
2. Verificar CORS (deve permitir DELETE)
3. Verificar autenticação (token válido)

### Visual errado
1. Verificar cores no contexto PreferencesContext
2. Verificar se estilos estão sendo aplicados
3. Verificar se isDark/isHighContrast está correto

---

## 📞 Contato para Dúvidas

Consultar documentação:
- `RESUMO_IMPLEMENTACAO_TOGGLE.md` - Visão geral
- `IMPLEMENTACAO_TOGGLE_INTERESSE.md` - Detalhes técnicos
- `TESTE_TOGGLE_INTERESSE.md` - Plano de testes completo

---

**Tempo Estimado**: 5-20 minutos  
**Nível de Dificuldade**: Fácil  
**Data**: 2026-11-24
