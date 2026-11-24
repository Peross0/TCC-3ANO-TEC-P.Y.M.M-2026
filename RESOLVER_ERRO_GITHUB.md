# 🔴 Erro: Permission Denied - Como Resolver

## O Problema

```
Permission to Peross0/TCC-3ANO-TEC-P.Y.M.M-2026.git denied to mariafernandsilva.
```

**Significado:** Você está autenticado como `mariafernandsilva`, mas o repositório pertence a `Peross0`.

---

## ✅ Solução Rápida (3 passos)

### Passo 1: Abrir o "Credential Manager" do Windows

1. Pressione `Windows + R`
2. Digite: `control.exe /name Microsoft.CredentialManager`
3. Clique em "Credenciais do Windows"

### Passo 2: Remover credenciais antigas

1. Clique em "Gerenciar credenciais do Windows"
2. Procure por uma entrada que diga `git:https://github.com`
3. Clique nela e selecione "Remover"

### Passo 3: Fazer o push de novo

```bash
git push origin main
```

Quando pedir autenticação:
- **Username:** Seu username do GitHub (Peross0)
- **Password:** Seu token do GitHub ou senha

---

## 🎫 Se você não tem um Token

### Criar um Token no GitHub:

1. Acesse: https://github.com/settings/tokens
2. Clique "Generate new token" → "Generate new token (classic)"
3. Marque a box: `repo` (acesso completo)
4. Clique "Generate token"
5. **Copie o token** (você não verá de novo!)

### Usar o token:

```bash
git push origin main
```

Quando pedir:
- **Username:** Seu username do GitHub
- **Password:** Cole o token aqui

---

## 🔐 Alternativa: Usar SSH (Mais Seguro)

Se preferir, configure SSH:

```bash
# 1. Gerar chave
ssh-keygen -t ed25519 -C "seu-email@gmail.com"
# Pressione Enter 3 vezes

# 2. Adicionar chave ao GitHub
# Copie o conteúdo de: C:\Users\ALUNOS\.ssh\id_ed25519.pub
# Cole em: https://github.com/settings/keys

# 3. Mudar remote para SSH
git remote set-url origin git@github.com:Peross0/TCC-3ANO-TEC-P.Y.M.M-2026.git

# 4. Fazer push
git push origin main
```

---

## 📌 Resumo

| Problema | Solução |
|----------|---------|
| Erro 403 ao fazer push | Remover credencial antiga do Windows Credential Manager |
| Autenticado com usuário errado | Fazer login com a conta Peross0 (seu GitHub) |
| Sem token? | Gerar novo em https://github.com/settings/tokens |

---

## ✨ Depois de Resolver

Quando o push funcionar, você verá:

```
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
...
To https://github.com/Peross0/TCC-3ANO-TEC-P.Y.M.M-2026.git
 d91e672..d91e672  main -> main
```

E seus commits estarão em: **https://github.com/Peross0/TCC-3ANO-TEC-P.Y.M.M-2026**

---

**Tente agora e me avise se funcionou!** 🚀
