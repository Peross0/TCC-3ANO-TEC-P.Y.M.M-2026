import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
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
import MessageHeader from '../../components/MessageHeader';
import MessageInput from '../../components/MessageInput';
import { SessionContext } from '../../context/SessionContext';
import { apiFetch } from '../../lib/api';
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
  const { sessionData, setSessionData } = useContext(SessionContext);
  const [activeApplicationId, setActiveApplicationId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const isRecruiter = sessionData?.user?.user_type === 'RECRUITER';

  const conversations = useMemo(() => {
    const grouped = new Map(
      (sessionData?.conversations || []).map((conversation) => {
        const id = String(conversation.application_id);
        return [id, {
          id,
          applicationId: conversation.application_id,
          company: isRecruiter ? conversation.candidate_name : conversation.recruiter_name,
          jobTitle: conversation.job_title,
          messages: [],
        }];
      })
    );
    for (const message of sessionData?.messages || []) {
      const id = String(message.application_id);
      grouped.get(id)?.messages.push(message);
    }
    return [...grouped.values()].map((conversation) => ({
      ...conversation,
      lastMessage: conversation.messages.at(-1)?.body || '',
      timeAgo: formatTime(conversation.messages.at(-1)?.created_at),
    }));
  }, [isRecruiter, sessionData?.conversations, sessionData?.messages]);

  const activeChat = conversations.find((item) => item.id === activeApplicationId) || null;
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
      const response = await apiFetch('/messages');
      setSessionData((current) => ({ ...current, messages: response.messages }));
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
              const isUser = String(item.sender_id) === String(sessionData?.user?.id);
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
            onPress={() => setActiveApplicationId(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.company?.charAt(0) || 'C'}</Text>
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
            <Text style={styles.emptyTitle}>Sua caixa de entrada está vazia</Text>
            <Text style={styles.emptySubText}>As conversas ligadas às suas candidaturas aparecerão aqui.</Text>
          </View>
        }
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
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5F5FD' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#168AC7' },
  conversationContent: { flex: 1, marginLeft: 12 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  companyName: { fontSize: 15, fontWeight: '700', color: colors.text },
  timeAgo: { fontSize: 11, color: colors.muted },
  jobTitleTag: { fontSize: 11, fontWeight: '700', color: colors.primaryDark, marginVertical: 2 },
  lastMessage: { fontSize: 13, color: colors.muted },
  chatBody: { flex: 1 },
  messagesList: { padding: 16, gap: 10, flexGrow: 1 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primaryDark, borderBottomRightRadius: 2 },
  companyBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderBottomLeftRadius: 2 },
  messageText: { fontSize: 14, color: colors.text, lineHeight: 18 },
  userMessageText: { color: '#FFFFFF' },
  messageTime: { fontSize: 10, color: colors.muted, alignSelf: 'flex-end', marginTop: 4 },
  userMessageTime: { color: colors.primaryWash },
  sendingText: { textAlign: 'center', color: colors.muted, fontSize: 12, paddingBottom: 5 },
  emptyContainer: { flex: 1, paddingVertical: 60, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptySubText: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingHorizontal: 12 },
});
