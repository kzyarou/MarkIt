import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  serverTimestamp,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: any;
  read: boolean;
  messageType?: 'text' | 'image' | 'file';
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: any;
  };
  lastActivity: any;
  unreadCount: { [userId: string]: number };
  harvestId?: string; // Optional: link to specific harvest
  harvestTitle?: string; // Optional: harvest title for context
}

export class ConversationService {
  /**
   * Start a conversation between two users
   */
  static async startConversation(
    currentUserId: string, 
    otherUserId: string, 
    harvestId?: string,
    harvestTitle?: string
  ): Promise<string> {
    try {
      // Check if conversation already exists
      const existingConversationId = await this.findExistingConversation(currentUserId, otherUserId);
      if (existingConversationId) {
        return existingConversationId;
      }

      // Create new conversation
      const conversationsRef = collection(db, 'conversations');
      const conversationData = {
        participants: [currentUserId, otherUserId],
        lastMessage: {
          content: harvestId 
            ? `Started conversation about ${harvestTitle || 'a harvest'}`
            : 'Started conversation',
          senderId: currentUserId,
          timestamp: serverTimestamp()
        },
        lastActivity: serverTimestamp(),
        unreadCount: {
          [currentUserId]: 0,
          [otherUserId]: 1
        },
        ...(harvestId && { harvestId }),
        ...(harvestTitle && { harvestTitle })
      };

      const conversationRef = await addDoc(conversationsRef, conversationData);
      return conversationRef.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw new Error('Failed to start conversation');
    }
  }

  /**
   * Find existing conversation between two users
   */
  static async findExistingConversation(userId1: string, userId2: string): Promise<string | null> {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId1)
      );
      
      const snapshot = await getDocs(q);
      const existingConv = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(userId2);
      });

      return existingConv ? existingConv.id : null;
    } catch (error) {
      console.error('Error finding existing conversation:', error);
      return null;
    }
  }

  /**
   * Get conversations for a user
   */
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
      convs.sort((a, b) => {
        const ta = (a.lastActivity && (a.lastActivity as any).toDate) ? (a.lastActivity as any).toDate().getTime() : 0;
        const tb = (b.lastActivity && (b.lastActivity as any).toDate) ? (b.lastActivity as any).toDate().getTime() : 0;
        return tb - ta;
      });
      return convs;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Get messages for a conversation
   */
  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }

  /**
   * Send a message to a conversation
   */
  static async sendMessage(
    conversationId: string, 
    senderId: string, 
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<void> {
    try {
      // Add message to Firestore
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const messageData = {
        senderId,
        content,
        timestamp: serverTimestamp(),
        read: false,
        messageType
      };

      await addDoc(messagesRef, messageData);

      // Update conversation's last message and activity
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationUpdate = {
        lastMessage: {
          content,
          senderId,
          timestamp: serverTimestamp()
        },
        lastActivity: serverTimestamp(),
        [`unreadCount.${senderId}`]: 0
      };

      // Get conversation to update other participant's unread count
      const conversationDoc = await getDoc(conversationRef);
      if (conversationDoc.exists()) {
        const conversationData = conversationDoc.data() as Conversation;
        const otherParticipantId = conversationData.participants.find(id => id !== senderId);
        if (otherParticipantId) {
          conversationUpdate[`unreadCount.${otherParticipantId}`] = 
            (conversationData.unreadCount[otherParticipantId] || 0) + 1;
        }
      }

      await updateDoc(conversationRef, conversationUpdate);
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Mark messages as read for a user in a conversation
   */
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  /**
   * Get user data for conversation participants
   */
  static async getUserData(userId: string): Promise<{ name: string; avatar?: string; role?: string } | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          name: userData.name || userData.displayName || 'Unknown User',
          avatar: userData.avatar || userData.profilePicture || userData.profileImage,
          role: userData.role
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }
}
