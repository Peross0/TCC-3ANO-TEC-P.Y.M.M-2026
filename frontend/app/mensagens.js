import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { apiFetch, getSession } from '../lib/api';
import { colors } from '../lib/theme';

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function MensagensScreen() {
  const { nome, email } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [userId, setUserId] = useState(null);
  const [conversationsData, setConversationsData] = useState([]);
  const [messagesData, setMessagesData] = useState([]);
  const [activeApplicationId, setActiveApplicationId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    try {
      const [session, response] = await Promise.all([getSession(), apiFetch('/messages')]);
      const nextConversations = response.conversations || [];
      setUserId(session.user?.id ?? null);
      setConversationsData(nextConversations);
      setMessagesData(response.messages || []);
      setError('');
      setActiveApplicationId((current) => current || nextConversations[0]?.application_id || null);
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar as mensagens.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setIsLoading(true);
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]));

  const conversations = useMemo(() => {
    const grouped = new Map(conversationsData.map((conversation) => {
      const id = String(conversation.application_id);
      return [id, {
        id,
        applicationId: conversation.application_id,
        candidate: conversation.candidate_name || 'Candidato',
        jobTitle: conversation.job_title || 'Vaga',
        messages: [],
      }];
    }));

    for (const message of messagesData) {
      grouped.get(String(message.application_id))?.messages.push(message);
    }

    return [...grouped.values()].map((conversation) => ({
      ...conversation,
      lastMessage: conversation.messages.at(-1)?.body || 'Conversa iniciada pela candidatura',
      lastTime: formatTime(conversation.messages.at(-1)?.created_at),
    }));
  }, [conversationsData, messagesData]);

  const activeChat = conversations.find((item) => item.id === String(activeApplicationId)) || null;

  const sendMessage = async () => {
    const body = inputText.trim();
    if (!body || !activeChat || isSending) return;

    setIsSending(true);
    setError('');
    try {
      await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({ application_id: activeChat.applicationId, body }),
      });
      setInputText('');
      await loadMessages();
    } catch (sendError) {
      setError(sendError.message || 'Não foi possível enviar a mensagem.');
    } finally {
      setIsSending(false);
    }
  };

  const showList = isWide || !activeChat;
  const showChat = isWide || Boolean(activeChat);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.page}>
        <View style={styles.heading}>
          <Pressable onPress={() => router.replace({ pathname: '/home', params: { nome, email } })} style={styles.backButton} accessibilityLabel="Voltar para o início">
            <Feather name="arrow-left" size={19} color={colors.ink} />
          </Pressable>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>ÁREA EMPRESARIAL</Text>
            <Text style={styles.title}>Mensagens</Text>
          </View>
          <Pressable onPress={() => loadMessages()} style={styles.refreshButton} accessibilityLabel="Atualizar mensagens">
            <Feather name="refresh-cw" size={17} color={colors.primaryDark} />
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inbox}>
          {showList ? (
            <View style={[styles.conversationPane, isWide && styles.conversationPaneWide]}>
              <Text style={styles.paneTitle}>Candidaturas</Text>
              {isLoading && conversations.length === 0 ? (
                <View style={styles.center}><ActivityIndicator color={colors.primaryDark} /><Text style={styles.mutedText}>Carregando conversas...</Text></View>
              ) : conversations.length === 0 ? (
                <View style={styles.center}>
                  <Feather name="message-circle" size={30} color={colors.muted} />
                  <Text style={styles.emptyTitle}>Nenhuma conversa ainda</Text>
                  <Text style={styles.mutedText}>As candidaturas feitas no mobile aparecerão aqui.</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.conversationList}>
                  {conversations.map((conversation) => {
                    const selected = conversation.id === String(activeApplicationId);
                    return (
                      <Pressable
                        key={conversation.id}
                        onPress={() => setActiveApplicationId(conversation.applicationId)}
                        style={[styles.conversationItem, selected && styles.conversationSelected]}
                      >
                        <View style={styles.avatar}><Text style={styles.avatarText}>{conversation.candidate.charAt(0).toUpperCase()}</Text></View>
                        <View style={styles.conversationCopy}>
                          <View style={styles.conversationTopline}>
                            <Text style={styles.candidateName} numberOfLines={1}>{conversation.candidate}</Text>
                            <Text style={styles.timestamp}>{conversation.lastTime}</Text>
                          </View>
                          <Text style={styles.jobTitle} numberOfLines={1}>{conversation.jobTitle}</Text>
                          <Text style={styles.preview} numberOfLines={1}>{conversation.lastMessage}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          ) : null}

          {showChat ? (
            <View style={styles.chatPane}>
              {activeChat ? (
                <>
                  <View style={styles.chatHeader}>
                    {!isWide ? (
                      <Pressable onPress={() => setActiveApplicationId(null)} style={styles.mobileBack} accessibilityLabel="Voltar para conversas">
                        <Feather name="arrow-left" size={19} color={colors.ink} />
                      </Pressable>
                    ) : null}
                    <View style={styles.chatAvatar}><Text style={styles.avatarText}>{activeChat.candidate.charAt(0).toUpperCase()}</Text></View>
                    <View style={styles.chatHeadingCopy}>
                      <Text style={styles.candidateName}>{activeChat.candidate}</Text>
                      <Text style={styles.jobTitle}>{activeChat.jobTitle}</Text>
                    </View>
                  </View>

                  <ScrollView style={styles.messageScroll} contentContainerStyle={styles.messageList}>
                    {activeChat.messages.length === 0 ? (
                      <View style={styles.chatEmpty}><Text style={styles.mutedText}>Envie uma mensagem para iniciar a conversa.</Text></View>
                    ) : activeChat.messages.map((message) => {
                      const isCurrentUser = String(message.sender_id) === String(userId);
                      return (
                        <View key={message.id} style={[styles.bubble, isCurrentUser ? styles.ownBubble : styles.otherBubble]}>
                          <Text style={[styles.messageText, isCurrentUser && styles.ownMessageText]}>{message.body}</Text>
                          <Text style={[styles.timestamp, isCurrentUser && styles.ownTimestamp]}>{formatTime(message.created_at)}</Text>
                        </View>
                      );
                    })}
                  </ScrollView>

                  <View style={styles.composer}>
                    <TextInput
                      value={inputText}
                      onChangeText={setInputText}
                      placeholder="Escreva uma mensagem..."
                      placeholderTextColor={colors.muted}
                      multiline
                      maxLength={2000}
                      style={styles.input}
                      onSubmitEditing={sendMessage}
                    />
                    <Pressable onPress={sendMessage} disabled={!inputText.trim() || isSending} style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendDisabled]} accessibilityRole="button" accessibilityLabel="Enviar mensagem">
                      {isSending ? <ActivityIndicator size="small" color={colors.ink} /> : <Feather name="send" size={17} color={colors.ink} />}
                    </Pressable>
                  </View>
                </>
              ) : (
                <View style={styles.center}><Feather name="message-square" size={34} color={colors.muted} /><Text style={styles.mutedText}>Selecione uma candidatura para conversar.</Text></View>
              )}
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  page: { flex: 1, width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  heading: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  backButton: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headingCopy: { flex: 1 },
  eyebrow: { color: colors.primaryDark, fontSize: 9, fontWeight: '800', marginBottom: 3 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '700' },
  refreshButton: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  errorText: { color: colors.danger, paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, marginBottom: 10 },
  inbox: { flex: 1, minHeight: 440, flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 12, overflow: 'hidden' },
  conversationPane: { flex: 1, minWidth: 0, padding: 15 },
  conversationPaneWide: { flex: 0.9, maxWidth: 360, borderRightWidth: 1, borderRightColor: colors.line },
  paneTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  conversationList: { paddingTop: 7 },
  conversationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  conversationSelected: { backgroundColor: colors.primaryWash },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accentWash, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primaryDark, fontSize: 16, fontWeight: '800' },
  conversationCopy: { flex: 1, minWidth: 0, marginLeft: 10 },
  conversationTopline: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  candidateName: { color: colors.ink, fontSize: 13, fontWeight: '700', flexShrink: 1 },
  timestamp: { color: colors.muted, fontSize: 10 },
  jobTitle: { color: colors.primaryDark, fontSize: 11, fontWeight: '700', marginTop: 3 },
  preview: { color: colors.muted, fontSize: 12, marginTop: 4 },
  chatPane: { flex: 1, minWidth: 0 },
  chatHeader: { minHeight: 67, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  mobileBack: { marginRight: 10 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentWash, alignItems: 'center', justifyContent: 'center' },
  chatHeadingCopy: { marginLeft: 10 },
  messageScroll: { flex: 1 },
  messageList: { flexGrow: 1, justifyContent: 'flex-end', padding: 16, gap: 9 },
  bubble: { maxWidth: '82%', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12 },
  ownBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  otherBubble: { alignSelf: 'flex-start', backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.line },
  messageText: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  ownMessageText: { color: colors.ink },
  ownTimestamp: { color: colors.inkSoft, textAlign: 'right' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, padding: 12, borderTopWidth: 1, borderTopColor: colors.line },
  input: { flex: 1, minHeight: 42, maxHeight: 110, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 10, color: colors.ink, fontSize: 13 },
  sendButton: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.5 },
  center: { flex: 1, minHeight: 200, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 9 },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  mutedText: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  chatEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});