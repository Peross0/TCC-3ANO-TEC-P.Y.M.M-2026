# Como Fazer Push do Código para o GitHub

## 🔧 Pré-requisitos

Você precisa configurar suas credenciais do GitHub no Git. Escolha uma das opções:

### Opção 1: Usar Token de Acesso Pessoal (Recomendado)

1. **Gere um token no GitHub:**
   - Acesse: https://github.com/settings/tokens
   - Clique em "Generate new token" → "Generate new token (classic)"
   - Dê um nome (ex: "Git Access")
   - Selecione os escopos: `repo` (acesso completo aos repositórios)
   - Clique em "Generate token"
   - **Copie o token** (você não verá novamente)

2. **Configure no Git:**
   ```bash
   git config --global user.name "seu-username"
   git config --global user.email "seu-email@gmail.com"
   ```

3. **Faça o Push com o token:**
   ```bash
   git push origin main
   ```
   - Quando pedir "username": Digite seu username do GitHub
   - Quando pedir "password": Cole o token que você copiou

### Opção 2: Usar SSH

1. **Gere uma chave SSH:**
   ```bash
   ssh-keygen -t ed25519 -C "seu-email@gmail.com"
   ```
   - Pressione Enter para aceitar o local padrão
   - Pressione Enter 2x para não adicionar senha

2. **Adicione a chave no GitHub:**
   - Abra: `C:\Users\ALUNOS\.ssh\id_ed25519.pub`
   - Copie o conteúdo
   - Acesse: https://github.com/settings/keys
   - Clique "New SSH key"
   - Cole e salve

3. **Configure o Git para usar SSH:**
   ```bash
   git remote set-url origin git@github.com:Peross0/TCC-3ANO-TEC-P.Y.M.M-2026.git
   git push origin main
   ```

---

## 📋 Status Atual

✅ **Commits prontos para push:**
- `d91e672` - Salvar códigos da implementação de toggle 'Tenho Interesse'
- `0c8cc24` - Adicionar guia 'Comece Aqui' para rápida navegação
- `4a597fa` - Adicionar arquivo de status de conclusão
- `6573c76` - Adicionar README principal para toggle 'Tenho Interesse'
- `ceda2ec` - Adicionar documentação de arquitetura da solução
- `a5a5699` - Adicionar guia rápido de teste manual
- `cca8f26` - Adicionar documentação da funcionalidade de toggle 'Tenho Interesse'
- `5b2ae3b` - Implementar alternância (toggle) do botão 'Tenho Interesse' nas vagas

---

## 🚀 Resumo Rápido

**Arquivos modificados no toggle:**
- `mobile/meu-app-mobile/app/(tabs)/home.js` - Função `applyToJob()` com lógica de toggle
- `mobile/meu-app-mobile/components/jobs/JobCard.js` - Botão com visual dinâmico

**Documentação criada:**
- `README_TOGGLE_INTERESSE.md` - Documentação completa
- `TESTE_MANUAL_RAPIDO.md` - Guia de testes
- `ARQUITETURA_SOLUCAO.md` - Arquitetura da solução
- E mais 4 arquivos de documentação

---

## ✨ O que foi implementado

✅ Função `applyToJob()` detecta estado (aplicou ou não)  
✅ Se já aplicou → DELETE (remove interesse)  
✅ Se não aplicou → POST (marca interesse)  
✅ Botão muda visualmente conforme estado  
✅ Texto dinâmico: "Tenho interesse" ↔ "Interesse registrado"  
✅ Cores mudam: branco → preenchido  
✅ Dados salvos no banco de dados  
✅ Persistem após fechar/abrir app  
✅ Cada vaga tem estado independente  

---

## 💡 Próximos Passos

1. Configure suas credenciais GitHub (opção 1 ou 2 acima)
2. Execute: `git push origin main`
3. Veja seus commits em: https://github.com/Peross0/TCC-3ANO-TEC-P.Y.M.M-2026
