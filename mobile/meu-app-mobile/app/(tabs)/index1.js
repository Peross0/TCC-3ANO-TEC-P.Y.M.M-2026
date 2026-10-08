import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import MessageHeader from '../../components/messages/MessageHeader';
import MessageInput from '../../components/messages/MessageInput';
import { SessionContext } from '../../context/SessionContext';
import { apiFetch, getAssetUrl } from '../../lib/api';
import { Colors } from '../../constants/theme';

const colors = Colors.light;

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessagesScreen() {
  const { sessionData } = useContext(SessionContext);
  const router = useRouter();
  const [authenticatedUserId, setAuthenticatedUserId] = useState(sessionData?.user?.id ?? null);
  const currentUserId = sessionData?.user?.id ?? authenticatedUserId;
  const [activeApplicationId, setActiveApplicationId] = useState(null);
  const [conversationsData, setConversationsData] = useState([]);
  const [messagesData, setMessagesData] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isRecruiter = sessionData?.user?.user_type === 'RECRUITER';

  useEffect(() => {
    if (sessionData?.user?.id != null) return undefined;

    let active = true;
    apiFetch('/auth/me')
      .then(({ user }) => {
        if (active) setAuthenticatedUserId(user.id);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [sessionData?.user?.id]);

  const conversations = useMemo(() => {
    const grouped = new Map(
      conversationsData.map((conversation) => {
        const id = String(conversation.application_id);
        return [id, {
          id,
          applicationId: conversation.application_id,
          company: isRecruiter
            ? conversation.candidate_name
            : conversation.company_name || conversation.recruiter_name,
          companyLogoUri: isRecruiter ? null : getAssetUrl(conversation.company_logo_url),
          jobTitle: conversation.job_title,
          messages: [],
        }];
      })
    );
    for (const message of messagesData) {
      const id = String(message.application_id);
      grouped.get(id)?.messages.push(message);
    }
    return [...grouped.values()].map((conversation) => ({
      ...conversation,
      lastMessage: conversation.messages.at(-1)?.body || '',
      timeAgo: formatTime(conversation.messages.at(-1)?.created_at),
    }));
  }, [isRecruiter, conversationsData, messagesData]);

  const loadMessages = useCallback(async (showError = false) => {
    try {
      const response = await apiFetch('/messages');
      setConversationsData(response.conversations || []);
      setMessagesData(response.messages || []);
    } catch (error) {
      if (showError) {
        Alert.alert('Erro ao carregar mensagens', error.message || 'Não foi possível conectar ao servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setIsLoading(true);
    loadMessages(true);
    const refreshInterval = setInterval(() => loadMessages(), 5000);
    return () => clearInterval(refreshInterval);
  }, [loadMessages]));

  const activeChat = conversations.find((item) => String(item.applicationId) === String(activeApplicationId)) || null;
  const filteredConversations = conversations.filter((item) =>
    `${item.company} ${item.jobTitle}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    const body = inputText.trim();
    if (!body || !activeChat || isSending) return;

    setIsSending(true);
    try {
      await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({
          application_id: activeChat.applicationId,
          body,
        }),
      });
      await loadMessages();
      setInputText('');
    } catch (error) {
      Alert.alert('Mensagem não enviada', error instanceof TypeError
        ? 'Não foi possível conectar ao servidor.'
        : error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (activeChat) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <MessageHeader activeChat={activeChat} onBack={() => setActiveApplicationId(null)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatBody}
        >
          <FlatList
            data={activeChat.messages}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.messagesList}
            renderItem={({ item }) => {
              const isUser = currentUserId != null && String(item.sender_id) === String(currentUserId);
              return (
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.companyBubble]}>
                  <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.body}</Text>
                  <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Nenhuma mensagem nesta conversa.</Text>
                <Text style={styles.emptySubText}>Envie a primeira mensagem sobre esta candidatura.</Text>
              </View>
            }
          />
          <MessageInput value={inputText} onChangeText={setInputText} onSend={handleSendMessage} />
          {isSending && <Text style={styles.sendingText}>Enviando mensagem...</Text>}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}><Text style={styles.title}>Mensagens</Text></View>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.muted} />
          <TextInput
            placeholder="Pesquisar conversa..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.conversationsList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => setActiveApplicationId(String(item.applicationId))}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              {item.companyLogoUri
                ? <Image source={{ uri: item.companyLogoUri }} style={styles.companyLogoImage} resizeMode="cover" />
                : <Feather name="briefcase" size={19} color="#168AC7" />}
            </View>
            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={styles.companyName}>{item.company}</Text>
                <Text style={styles.timeAgo}>{item.timeAgo}</Text>
              </View>
              <Text style={styles.jobTitleTag}>{item.jobTitle}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="message-square" size={40} color={colors.line} />
            <Text style={styles.emptyTitle}>{isLoading ? 'Carregando conversas...' : 'Sua caixa de entrada está vazia'}</Text>
            <Text style={styles.emptySubText}>{isLoading ? 'Buscando mensagens do servidor.' : 'As conversas aparecem depois que você se candidata a uma vaga.'}</Text>
            {!isLoading && (
              <TouchableOpacity
                style={styles.jobsButton}
                onPress={() => router.navigate('/(tabs)/home')}
                accessibilityRole="button"
              >
                <Text style={styles.jobsButtonText}>Ver vagas</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        onRefresh={() => loadMessages(true)}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  searchContainer: { paddingHorizontal: 16, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: colors.text },
  conversationsList: { paddingHorizontal: 16, paddingBottom: 20 },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5F5FD', overflow: 'hidden' },
  companyLogoImage: { width: '100%', height: '100%' },
  conversationContent: { flex: 1, marginLeft: 12 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  companyName: { fontSize: 15, fontWeight: '700', color: colors.text },
  timeAgo: { fontSize: 11, color: colors.muted },
  jobTitleTag: { fontSize: 11, fontWeight: '700', color: colors.primaryDark, marginVertical: 2 },
  lastMessage: { fontSize: 13, color: colors.muted },
  chatBody: { flex: 1 },
  messagesList: { padding: 16, gap: 10, flexGrow: 1 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#147BA3', borderBottomRightRadius: 2 },
  companyBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderBottomLeftRadius: 2 },
  messageText: { fontSize: 14, color: colors.text, lineHeight: 18 },
  userMessageText: { color: '#FFFFFF' },
  messageTime: { fontSize: 10, color: colors.muted, alignSelf: 'flex-end', marginTop: 4 },
  userMessageTime: { color: '#EAF7FD' },
  sendingText: { textAlign: 'center', color: colors.muted, fontSize: 12, paddingBottom: 5 },
  emptyContainer: { flex: 1, paddingVertical: 60, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptySubText: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingHorizontal: 12 },
  jobsButton: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, backgroundColor: colors.tint },
  jobsButtonText: { fontSize: 13, fontWeight: '700', color: colors.text },
});
