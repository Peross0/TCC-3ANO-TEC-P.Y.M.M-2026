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

export default function MessagesScreen() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
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
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        
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
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#8E8E93" />
          <TextInput
            placeholder="Pesquisar conversa..."
            placeholderTextColor="#8E8E93"
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
            <View style={[styles.avatar, { backgroundColor: item.logoBg || '#E3F2FD' }]}>
              <Text style={[styles.avatarText, { color: item.logoTextColor || '#1565C0' }]}>
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
            <Feather name="message-square" size={40} color="#CCCCCC" />
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
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
  },
  conversationsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
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
    color: '#333333',
  },
  timeAgo: {
    fontSize: 11,
    color: '#8E8E93',
  },
  jobTitleTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3BB7FF',
    marginVertical: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: '#777777',
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
    backgroundColor: '#3BB7FF',
    borderBottomRightRadius: 2,
  },
  companyBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 18,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 10,
    color: '#8E8E93',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userMessageTime: {
    color: '#E0F4FF',
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
    color: '#333333',
  },
  emptySubText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
});