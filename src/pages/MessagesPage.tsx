import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Search, 
  Plus, 
  Send,
  Smile,
  Paperclip
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBottomNav } from '@/hooks/use-mobile';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any; // Firestore timestamp
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: any;
  };
  lastActivity: any; // Firestore timestamp
  unreadCount: { [userId: string]: number }; // Unread count per user
  harvestId?: string; // Optional: link to specific harvest
  harvestTitle?: string; // Optional: harvest title for context
}

const MessagesPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { bottomNavClass } = useBottomNav();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState<{ [userId: string]: { name: string; avatar?: string } }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [messageUnsubscribe, setMessageUnsubscribe] = useState<(() => void) | null>(null);

  // Load cached conversations and userData first for instant UI, then attach realtime listener
  useEffect(() => {
    try {
      const cachedConvs = localStorage.getItem('markit:conversations');
      const cachedUsers = localStorage.getItem('markit:conversationUsers');
      if (cachedConvs) {
        setConversations(JSON.parse(cachedConvs));
      }
      if (cachedUsers) {
        setUserData(JSON.parse(cachedUsers));
      }
    } catch {}
  }, []);

  // Load conversations from Firestore
  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe: (() => void) | undefined;

    const loadConversations = () => {
      try {
        // Query conversations where current user is a participant
        const conversationsRef = collection(db, 'conversations');
        const q = query(
          conversationsRef,
          where('participants', 'array-contains', user.id),
          limit(50) // Avoid composite index by sorting client-side
        );

        unsubscribe = onSnapshot(q, async (snapshot) => {
          const conversationsData: Conversation[] = [];
          const userIds = new Set<string>();

          snapshot.forEach((doc) => {
            const data = doc.data() as Conversation;
            conversationsData.push({ ...data, id: doc.id });
            
            // Collect all participant IDs to fetch user data
            data.participants.forEach(id => {
              if (id !== user.id) userIds.add(id);
            });
          });

          // Fetch user data for all participants
          const userPromises = Array.from(userIds).map(async (userId) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                  [userId]: {
                    name: userData.name || userData.displayName || 'Unknown User',
                    avatar: userData.avatar || userData.profilePicture || userData.profileImage
                  }
                };
              }
            } catch (error) {
              console.error('Error fetching user data for:', userId, error);
            }
            return { [userId]: { name: 'Unknown User' } };
          });

          const userDataResults = await Promise.all(userPromises);
          const combinedUserData = userDataResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
          
          console.log('Loaded user data:', combinedUserData);
          setUserData(prev => {
            const next = { ...prev, ...combinedUserData };
            try { localStorage.setItem('markit:conversationUsers', JSON.stringify(next)); } catch {}
            return next;
          });

          // Sort client-side by lastActivity desc
          conversationsData.sort((a, b) => {
            const ta = (a.lastActivity && a.lastActivity.toDate) ? a.lastActivity.toDate().getTime() : 0;
            const tb = (b.lastActivity && b.lastActivity.toDate) ? b.lastActivity.toDate().getTime() : 0;
            return tb - ta;
          });
          setConversations(conversationsData);
          try { localStorage.setItem('markit:conversations', JSON.stringify(conversationsData)); } catch {}
        });
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();
    
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user?.id]);

  // Handle URL parameters for conversation selection
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conversationExists = conversations.find(conv => conv.id === conversationId);
      if (conversationExists) {
        setSelectedConversation(conversationId);
        handleSelectConversation(conversationId);
      }
    }
  }, [searchParams, conversations]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && user?.id) {
      // Mark messages as read for the current user
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation && conversation.unreadCount[user.id] > 0) {
        // Update unread count in local state
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation 
            ? { ...conv, unreadCount: { ...conv.unreadCount, [user.id]: 0 } }
            : conv
        ));

        // Update unread count in Firestore
        const conversationRef = doc(db, 'conversations', selectedConversation);
        updateDoc(conversationRef, {
          [`unreadCount.${user.id}`]: 0
        }).catch(error => {
          console.error('Error marking messages as read:', error);
        });
      }
    }
  }, [selectedConversation, user?.id, conversations]);

  // Cleanup message listener on unmount
  useEffect(() => {
    return () => {
      if (messageUnsubscribe) {
        messageUnsubscribe();
      }
    };
  }, [messageUnsubscribe]);

  const filteredConversations = conversations.filter(conv => {
    const otherParticipantId = conv.participants.find(id => id !== user?.id);
    const participantName = otherParticipantId ? userData[otherParticipantId]?.name || 'Unknown User' : 'Unknown User';
    return participantName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      // Add message to Firestore
      const messagesRef = collection(db, 'conversations', selectedConversation, 'messages');
      const messageData = {
        senderId: user.id,
        content: messageContent,
        timestamp: serverTimestamp(),
        read: false
      };

      await addDoc(messagesRef, messageData);

      // Update conversation's last message and activity
      const conversationRef = doc(db, 'conversations', selectedConversation);
      const selectedConv = conversations.find(c => c.id === selectedConversation);
      
      if (selectedConv) {
        const otherParticipantId = selectedConv.participants.find(id => id !== user.id);
        const conversationUpdate = {
          lastMessage: {
            content: messageContent,
            senderId: user.id,
            timestamp: serverTimestamp()
          },
          lastActivity: serverTimestamp(),
          [`unreadCount.${user.id}`]: 0
        };

        if (otherParticipantId) {
          conversationUpdate[`unreadCount.${otherParticipantId}`] = (selectedConv.unreadCount[otherParticipantId] || 0) + 1;
        }

        await updateDoc(conversationRef, conversationUpdate);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Restore the message if sending failed
      setNewMessage(messageContent);
      alert('Error sending message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    // Clean up previous message listener
    if (messageUnsubscribe) {
      messageUnsubscribe();
    }

    setSelectedConversation(conversationId);
    setIsLoading(true);
    
    // Load messages from Firestore with real-time updates
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100)); // Load last 100 messages
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        messagesData.push({ ...doc.data() as Message, id: doc.id });
      });
      setMessages(messagesData);
      setIsLoading(false);
    }, (error) => {
      console.error('Error listening to messages:', error);
      setIsLoading(false);
    });

    // Store unsubscribe function for cleanup
    setMessageUnsubscribe(() => unsubscribe);

    // Ensure user data is loaded for the selected conversation
    const selectedConv = conversations.find(c => c.id === conversationId);
    if (selectedConv && user?.id) {
      const otherParticipantId = selectedConv.participants.find(id => id !== user.id);
      if (otherParticipantId && !userData[otherParticipantId]) {
        // Load user data for the other participant if not already loaded
        getDoc(doc(db, 'users', otherParticipantId)).then((userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(prev => ({
              ...prev,
              [otherParticipantId]: {
                name: userData.name || userData.displayName || 'Unknown User',
                avatar: userData.avatar || userData.profilePicture || userData.profileImage
              }
            }));
          }
        }).catch(error => {
          console.error('Error loading user data for selected conversation:', error);
        });
      }
    }
  };

  const formatTime = (timestamp: any) => {
    let dateObj: Date;
    
    // Handle Firestore Timestamp
    if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
      dateObj = timestamp.toDate();
    } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      // Handle Firestore Timestamp with seconds property
      dateObj = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      dateObj = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      dateObj = new Date(timestamp);
    } else {
      return 'Invalid date';
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return t('just_now') || 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className={`container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl ${bottomNavClass}`}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <div className={`w-full ${selectedConversation ? 'hidden lg:block lg:w-1/3' : 'block'}`}>
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">{t('messages_title') || 'Messages'}</CardTitle>
                <Button size="sm" variant="outline" className="hidden sm:flex">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('messages_new_chat') || 'New Chat'}
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('messages_search_ph') || 'Search conversations...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <MessageCircle className="h-12 w-12 mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">{t('messages_empty_title') || 'No conversations yet'}</h3>
                  <p className="text-sm text-center mb-4">
                    {t('messages_empty_desc') || 'Start a conversation with farmers or buyers about their harvests'}
                  </p>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('messages_start_chat') || 'Start New Chat'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-green-50 border-r-4 border-green-500' : ''
                      }`}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {(() => {
                            const otherParticipantId = conversation.participants.find(id => id !== user?.id);
                            const participantData = otherParticipantId ? userData[otherParticipantId] : null;
                            const participantName = participantData?.name || 'Unknown User';
                            const unreadCount = user?.id ? conversation.unreadCount[user.id] || 0 : 0;
                            
                            return (
                              <>
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={participantData?.avatar} />
                                  <AvatarFallback className="bg-green-100 text-green-800 font-medium">
                                    {participantName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {unreadCount > 0 && (
                                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-sm truncate">
                                {(() => {
                                  const otherParticipantId = conversation.participants.find(id => id !== user?.id);
                                  const participantData = otherParticipantId ? userData[otherParticipantId] : null;
                                  return participantData?.name || 'Unknown User';
                                })()}
                              </h3>
                              {conversation.harvestTitle && (
                                <Badge variant="outline" className="text-xs">
                                  {conversation.harvestTitle}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const unreadCount = user?.id ? conversation.unreadCount[user.id] || 0 : 0;
                                return unreadCount > 0 && (
                                  <Badge className="bg-green-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                    {unreadCount}
                                  </Badge>
                                );
                              })()}
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className={`text-sm truncate ${
                            (() => {
                              const unreadCount = user?.id ? conversation.unreadCount[user.id] || 0 : 0;
                              return unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500';
                            })()
                          }`}>
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 ${selectedConversation ? 'block' : 'hidden lg:block'}`}>
          {selectedConversation ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Back button for mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      ← {t('back') || 'Back'}
                    </Button>
                    {(() => {
                      const otherParticipantId = selectedConv?.participants.find(id => id !== user?.id);
                      const participantData = otherParticipantId ? userData[otherParticipantId] : null;
                      const participantName = participantData?.name || 'Unknown User';
                      
                      return (
                        <>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={participantData?.avatar} />
                            <AvatarFallback className="bg-green-100 text-green-800 font-medium">
                              {participantName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{participantName}</h3>
                            <p className="text-sm text-gray-500">{t('online') || 'Online'}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto pb-28 sm:pb-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>{t('messages_none') || 'No messages yet. Start a conversation!'}</p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isOwnMessage = message.senderId === user?.id;
                        const showAvatar = !isOwnMessage && (
                          index === 0 || 
                          messages[index - 1].senderId !== message.senderId
                        );
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex items-end space-x-2 ${
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {!isOwnMessage && (
                              <div className="w-8 h-8 flex-shrink-0">
                                {showAvatar ? (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={userData[message.senderId]?.avatar} />
                                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                      {userData[message.senderId]?.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="w-8 h-8" />
                                )}
                              </div>
                            )}
                            
                            <div className={`max-w-xs lg:max-w-md ${
                              isOwnMessage ? 'order-1' : 'order-2'
                            }`}>
                              <div
                                className={`px-4 py-2 rounded-lg ${
                                  isOwnMessage
                                    ? 'bg-green-500 text-white rounded-br-sm'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                }`}
                              >
                                <p className="text-sm break-words">{message.content}</p>
                                <div className={`flex items-center justify-between mt-1 ${
                                  isOwnMessage ? 'text-green-100' : 'text-gray-500'
                                }`}>
                                  <span className="text-xs">
                                    {formatTime(message.timestamp)}
                                  </span>
                                  {isOwnMessage && (
                                    <span className="text-xs ml-2">
                                      {message.read ? '✓✓' : '✓'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {isOwnMessage && (
                              <div className="w-8 h-8 flex-shrink-0 order-2" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>

              {/* Message Input - fixed above bottom nav on mobile */}
              <div className="p-3 sm:p-4 border-t bg-white fixed left-0 right-0 bottom-[96px] z-[60] sm:static">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="hidden sm:flex">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder={t('messages_input_ph') || 'Type a message...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 h-10 sm:h-11"
                    disabled={!selectedConversation}
                  />
                  <Button size="sm" variant="outline" className="hidden sm:flex">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()}
                    size="sm"
                    className="h-10 w-10 sm:h-11 sm:w-11 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">{t('messages_welcome') || 'Welcome to Messages'}</h3>
                <p className="mb-4">{t('messages_welcome_desc') || 'Start conversations with farmers and buyers about harvests'}</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• {t('messages_tip_contact') || 'Contact farmers about their products'}</p>
                  <p>• {t('messages_tip_negotiate') || 'Negotiate prices and delivery'}</p>
                  <p>• {t('messages_tip_quality') || 'Ask questions about harvest quality'}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
