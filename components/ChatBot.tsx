import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Pressable,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeOut, 
  ZoomIn, 
  ZoomOut 
} from 'react-native-reanimated';
import { useWorkouts } from '../contexts/WorkoutContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChatBot({ isVisible, onClose }: ChatBotProps) {
  const { totalPRsCount, completedSessions } = useWorkouts();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there! I'm your LogLift assistant. How can I help you crush your workout today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const generateResponse = (userText: string) => {
    const text = userText.toLowerCase();
    
    if (text.includes('hello') || text.includes('hi')) {
      return "Hi! Ready to log some gains today?";
    }
    
    if (text.includes('pr') || text.includes('personal record')) {
      return `You've achieved ${totalPRsCount} PRs so far! Keep pushing, you're doing great.`;
    }
    
    if (text.includes('tip') || text.includes('advice')) {
      const tips = [
        "Focus on your mind-muscle connection. Feel the muscle working throughout the entire range of motion.",
        "Don't skip your warm-up sets! They prepare your nervous system for the heavy work.",
        "Hydration is key. Make sure you're drinking enough water during your session.",
        "Consistency beats intensity in the long run. Stick to your schedule!",
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }

    if (text.includes('workout') || text.includes('session')) {
      return `You've completed ${completedSessions.length} sessions recently. That's a solid trend!`;
    }

    return "That's interesting! Tell me more about your fitness goals.";
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(userMessage.text),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop to close when clicking outside */}
      <Pressable style={styles.backdrop} onPress={onClose} />
      
      <Animated.View 
        entering={ZoomIn.duration(300).springify()} 
        exiting={ZoomOut.duration(200)}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.botIcon}>
              <Feather name="cpu" size={16} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>LogLift Assistant</Text>
              <Text style={styles.headerSubtitle}>Online</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={20} color="#0a0a0a" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.sender === 'user' ? styles.userBubble : styles.botBubble
            ]}>
              <Text style={[
                styles.messageText,
                item.sender === 'user' ? styles.userText : styles.botText
              ]}>
                {item.text}
              </Text>
              <Text style={styles.timestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
          ListFooterComponent={isTyping ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#717182" />
              <Text style={styles.typingText}>Thinking...</Text>
            </View>
          ) : null}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor="#717182"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              onPress={handleSend} 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              disabled={!inputText.trim()}
            >
              <Feather name="send" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f5',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#030213',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#10b981',
  },
  closeButton: {
    padding: 4,
  },
  messageList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 10,
    borderRadius: 16,
    marginBottom: 12,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f3f5',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#030213',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  botText: {
    color: '#0a0a0a',
  },
  userText: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 9,
    marginTop: 2,
    color: '#a1a1aa',
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
    marginBottom: 16,
  },
  typingText: {
    fontSize: 12,
    color: '#717182',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f3f5',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9fb',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 80,
    fontSize: 14,
    color: '#0a0a0a',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#030213',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e2e7',
  }
});
