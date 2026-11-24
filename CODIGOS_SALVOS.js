// ============================================================================
// IMPLEMENTAÇÃO: Toggle "Tenho Interesse" - Conecta Fácil Mobile
// ============================================================================
// 
// Arquivo 1: mobile/meu-app-mobile/app/(tabs)/home.js
// Função: applyToJob()
// 
// Descrição: Função que implementa o toggle de interesse em vagas.
// Detecta se o usuário já aplicou e faz POST (adicionar) ou DELETE (remover)
// ============================================================================

const applyToJob = async (vacancyId) => {
  if (applyingToJob !== null) return;

  const vacancyIdStr = String(vacancyId);
  const isCurrentlyApplied = appliedVacancyIdSet.has(vacancyIdStr);

  setApplyingToJob(vacancyIdStr);
  try {
    if (isCurrentlyApplied) {
      // REMOVER INTERESSE - DELETE
      await apiFetch(`/candidates/applications/${vacancyId}`, {
        method: "DELETE",
      });
      setAppliedVacancyIds((current) =>
        current.filter((id) => id !== vacancyIdStr),
      );
      setSessionData((current) =>
        current
          ? {
              ...current,
              applications: (current.applications || []).filter(
                (item) => String(item.vacancy_id) !== vacancyIdStr,
              ),
            }
          : current,
      );
      Alert.alert(
        "Interesse removido",
        "Você removeu seu interesse nesta vaga.",
      );
    } else {
      // ADICIONAR INTERESSE - POST
      const result = await apiFetch(
        `/candidates/vacancies/${vacancyId}/apply`,
        {
          method: "POST",
        },
      );
      const application = {
        ...result.application,
        vacancy_id: vacancyId,
        job_title: jobs.find(
          (job) => String(job.vacancyId) === String(vacancyId),
        )?.title,
      };
      setAppliedVacancyIds((current) => [
        ...new Set([...current, vacancyIdStr]),
      ]);
      setSessionData((current) =>
        current
          ? {
              ...current,
              applications: [
                application,
                ...(current.applications || []).filter(
                  (item) => String(item.vacancy_id) !== vacancyIdStr,
                ),
              ],
            }
          : current,
      );
      Alert.alert(
        "Candidatura enviada",
        "A empresa poderá conversar com você pela aba Mensagens.",
      );
    }
  } catch (error) {
    Alert.alert(
      isCurrentlyApplied
        ? "Não foi possível remover seu interesse"
        : "Não foi possível se candidatar",
      error.message || "Tente novamente.",
    );
  } finally {
    setApplyingToJob(null);
  }
};

// ============================================================================
// 
// Arquivo 2: mobile/meu-app-mobile/components/jobs/JobCard.js
// Componente: JobCard - Botão "Tenho Interesse"
// 
// Descrição: Componente que renderiza o botão com visual dinâmico
// O texto e estilos mudam conforme o estado (aplicado ou não)
// ============================================================================

export default function JobCard({
  item,
  onApply,
  isApplied = false,
  isApplying = false,
  isFavorite = false,
  isSavingFavorite = false,
  onToggleFavorite,
}) {
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);

  return (
    <View style={[styles.card, preferences.high_contrast && styles.highContrastCard]}>
      {/* ... Header do card ... */}

      {/* Botão "Tenho Interesse" com Toggle */}
      <View style={styles.actionButtons}>
        {/* Botão Favorito */}
        <TouchableOpacity
          style={[styles.bookmarkButton, isFavorite && styles.bookmarkSelected]}
          onPress={() => onToggleFavorite?.(item.vacancyId)}
          disabled={isSavingFavorite}
        >
          <Ionicons
            name={isFavorite ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isFavorite ? colors.tint : colors.muted}
          />
        </TouchableOpacity>

        {/* Botão Interesse - TOGGLE */}
        <TouchableOpacity
          style={[styles.interestButton, isApplied && styles.interestButtonActive]}
          onPress={() => onApply?.(item.vacancyId)}
          disabled={isApplying}
          accessibilityLabel={isApplied ? 'Remover interesse na vaga' : 'Demonstrar interesse na vaga'}
          accessibilityState={{ disabled: isApplying, selected: isApplied }}
        >
          <Text style={[styles.interestButtonText, isApplied && styles.interestButtonActiveText]}>
            {isApplying ? 'Processando...' : isApplied ? 'Interesse registrado' : 'Tenho interesse'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// ESTILOS DO BOTÃO
// ============================================================================

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.15 : 1;
  return StyleSheet.create({
    // ... outros estilos ...

    // Botão no estado inativo (padrão)
    interestButton: {
      borderWidth: 1.5,
      borderColor: colors.tint,
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 14,
      backgroundColor: 'transparent',
    },

    // Botão no estado ativo (marcado)
    interestButtonActive: {
      backgroundColor: colors.tint,
      borderColor: colors.tint,
    },

    // Texto do botão (estado padrão)
    interestButtonText: {
      fontSize: 12 * scale,
      fontWeight: '700',
      color: colors.primaryDark,
    },

    // Texto do botão (estado ativo)
    interestButtonActiveText: {
      color: colors.surface,
    },

    // ... outros estilos ...
  });
}

// ============================================================================
// FLUXO DE FUNCIONAMENTO
// ============================================================================
//
// MARCAR INTERESSE:
// ─────────────────
// 1. Usuário clica em "Tenho interesse"
// 2. applyToJob() é chamado
// 3. Verifica: isCurrentlyApplied = false
// 4. Envia: POST /candidates/vacancies/{id}/apply
// 5. Backend registra em banco de dados (tabela interests)
// 6. Atualiza estado: setAppliedVacancyIds(), setSessionData()
// 7. Botão re-renderiza com:
//    - Texto: "Interesse registrado"
//    - Fundo preenchido (colors.tint)
//    - Texto claro (colors.surface)
// 8. Mensagem de sucesso: "Candidatura enviada"
//
// DESMARCAR INTERESSE:
// ───────────────────
// 1. Usuário clica em "Interesse registrado"
// 2. applyToJob() é chamado
// 3. Verifica: isCurrentlyApplied = true
// 4. Envia: DELETE /candidates/applications/{id}
// 5. Backend remove do banco de dados (tabela interests)
// 6. Atualiza estado: setAppliedVacancyIds(), setSessionData()
// 7. Botão re-renderiza com:
//    - Texto: "Tenho interesse"
//    - Fundo transparente
//    - Texto escuro (colors.primaryDark)
// 8. Mensagem de sucesso: "Interesse removido"
//
// ============================================================================
// PONTOS-CHAVE DA IMPLEMENTAÇÃO
// ============================================================================
//
// ✅ TOGGLE FUNCIONAL
//    - Clique para marcar: POST
//    - Clique para desmarcar: DELETE
//    - Pode repetir infinitamente
//
// ✅ VERIFICAÇÃO DE ESTADO
//    - appliedVacancyIdSet.has(vacancyId)
//    - Detecta automaticamente se já aplicou
//
// ✅ ISOLAMENTO DE VAGAS
//    - Cada vaga tem seu próprio estado
//    - Marcar em uma não afeta as outras
//
// ✅ PERSISTÊNCIA
//    - Dados salvos no banco de dados (tabela interests)
//    - SessionContext mantém em memória
//    - Estado persiste após restart
//
// ✅ VISUAL DINÂMICO
//    - Texto muda: "Tenho interesse" ↔ "Interesse registrado"
//    - Cores mudam: Transparente ↔ Preenchido
//    - Durante processamento: "Processando..."
//
// ✅ ACESSIBILIDADE
//    - Labels dinâmicas para leitores de tela
//    - Estados acessíveis (selected/disabled)
//
// ============================================================================
// APIS UTILIZADAS
// ============================================================================
//
// POST /candidates/vacancies/{id}/apply
// └─ Função: applyToVacancy(userId, vacancyId)
// └─ Resposta: 201 { message, application }
// └─ Ação: INSERT INTO interests
//
// DELETE /candidates/applications/{vacancyId}
// └─ Função: deleteApplication(userId, vacancyId)
// └─ Resposta: 200 { message }
// └─ Ação: DELETE FROM interests
//
// NOTA: Ambas as rotas já existiam - apenas reutilizadas!
//
// ============================================================================
// BANCO DE DADOS
// ============================================================================
//
// Tabela: interests
// ┌──────────────┬──────────────┬──────────────┬────────────────┐
// │ id           │ user_id      │ vacancy_id   │ status         │
// │ origin       │ created_at   │ updated_at   │                │
// └──────────────┴──────────────┴──────────────┴────────────────┘
//
// Operações:
// • INSERT: Quando usuário marca interesse
// • DELETE: Quando usuário desmar interesse
// • SELECT: Carregado no SessionContext ao iniciar
//
// ============================================================================
