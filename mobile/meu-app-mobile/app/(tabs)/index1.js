import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MessageHeader from '../../components/MessageHeader';
import MessageInput from '../../components/MessageInput';
import { Colors } from '../../constants/theme';

const colors = Colors.light;
const INITIAL_CONVERSATIONS = [
  {
    id: '1',
    company: 'Pires',
    jobTitle: 'Vaga de Caixa',
    lastMessage: 'Oi, você ainda está interessado na vaga?',
    timeAgo: 'Agora',
    unreadCount: 1,
    logoBg: colors.primaryWash,
    logoTextColor: colors.tint,
  },
  {
    id: '2',
    company: 'Pinheirão',
    jobTitle: 'Repositor',
    lastMessage: 'Você pode comparecer à entrevista na quinta?',
    timeAgo: '10 min',
    unreadCount: 0,
    logoBg: colors.limeWash,
    logoTextColor: colors.limeDark,
  },
  {
    id: '3',
    company: 'iFood',
    jobTitle: 'Entregador',
    lastMessage: 'Parabéns, seu perfil foi aprovado!',
    timeAgo: '1h',
    unreadCount: 2,
    logoBg: colors.accentWash,
    logoTextColor: colors.primaryDark,
  },
];

export default function MessagesScreen() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({
    '1': [
      { id: 'm1', text: 'Oi, você ainda está interessado na vaga?', sender: 'company', time: '09:40' },
      { id: 'm2', text: 'Sim, estou muito interessado!', sender: 'user', time: '09:42' },
    ],
    '2': [
      { id: 'm3', text: 'Você pode comparecer à entrevista na quinta?', sender: 'company', time: '08:15' },
    ],
    '3': [
      { id: 'm4', text: 'Parabéns, seu perfil foi aprovado!', sender: 'company', time: 'Ontem' },
    ],
  });
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenChat = (conversation) => {
    setActiveChat(conversation);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChat) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? { ...c, lastMessage: inputText.trim(), timeAgo: 'Agora' }
          : c
      )
    );

    setInputText('');
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeChat) {
    const messages = chatMessages[activeChat.id] || [];

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        <MessageHeader activeChat={activeChat} onBack={() => setActiveChat(null)} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatBody}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            renderItem={({ item }) => {
              const isUser = item.sender === 'user';
              return (
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.companyBubble,
                  ]}
                >
                  <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
                    {item.time}
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Nenhuma mensagem enviada ainda.</Text>
              </View>
            }
          />

          <MessageInput
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSendMessage}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
      </View>

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
            onPress={() => handleOpenChat(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: item.logoBg || colors.primaryWash }]}>
              <Text style={[styles.avatarText, { color: item.logoTextColor || colors.tint }]}>
                {item.company ? item.company.charAt(0) : 'C'}
              </Text>
            </View>

            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={styles.companyName}>{item.company}</Text>
                <Text style={styles.timeAgo}>{item.timeAgo}</Text>
              </View>
              <Text style={styles.jobTitleTag}>{item.jobTitle}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="message-square" size={40} color={colors.line} />
            <Text style={styles.emptyTitle}>Sua caixa de entrada está vazia</Text>
            <Text style={styles.emptySubText}>
              Suas conversas aparecerão aqui.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
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
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  conversationsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  timeAgo: {
    fontSize: 11,
    color: colors.muted,
  },
  jobTitleTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
    marginVertical: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: colors.inkSoft,
  },
  chatBody: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    gap: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryDark,
    borderBottomRightRadius: 2,
  },
  companyBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 10,
    color: colors.muted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userMessageTime: {
    color: colors.primaryWash,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
});