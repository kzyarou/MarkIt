import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  DollarSign, 
  Package, 
  MessageCircle,
  Calendar,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '@/types/markit';
import { useBottomNav } from '@/hooks/use-mobile';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { bottomNavClass } = useBottomNav();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'transactions' | 'system'>('all');
  const [showRead, setShowRead] = useState(true);

  // Mock notifications data - in a real app, this would come from Firebase
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: user?.id || '',
        type: 'harvest_expiring',
        title: 'Harvest Listing Expiring Soon',
        message: 'Your Corn harvest listing expires in 2 hours. Consider extending or reposting.',
        data: {
          harvestId: 'harvest-1',
          timeLeft: '2 hours'
        },
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        userId: user?.id || '',
        type: 'transaction_update',
        title: 'Transaction Completed',
        message: 'Your purchase of Fresh Tomatoes has been completed successfully.',
        data: {
          harvestId: 'harvest-2',
          farmerName: 'Maria Santos'
        },
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        userId: user?.id || '',
        type: 'harvest_expired',
        title: 'Harvest Listing Expired',
        message: 'Your Rice harvest listing has expired. You can repost it if still available.',
        data: {
          harvestId: 'harvest-3',
          timeLeft: '2 hours'
        },
        read: true,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        userId: user?.id || '',
        type: 'price_alert',
        title: 'Price Alert: Rice Market Update',
        message: 'Rice prices in your area have increased by 15%. Consider updating your listing price.',
        data: {
          commodity: 'Rice',
          priceChange: 15,
          area: 'Metro Manila'
        },
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        userId: user?.id || '',
        type: 'system',
        title: 'Welcome to MarkIt!',
        message: 'Thank you for joining MarkIt. Start by posting your first harvest or browsing available products.',
        data: {},
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  }, [user?.id]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'harvest_expiring':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'harvest_expired':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'price_alert':
        return <Bell className="h-5 w-5 text-purple-600" />;
      case 'transaction_update':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'system':
        return <MessageCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'harvest_expiring':
        return 'border-l-orange-500 bg-orange-50';
      case 'harvest_expired':
        return 'border-l-red-500 bg-red-50';
      case 'price_alert':
        return 'border-l-purple-500 bg-purple-50';
      case 'transaction_update':
        return 'border-l-blue-500 bg-blue-50';
      case 'system':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true, updatedAt: new Date().toISOString() }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ 
        ...notif, 
        read: true, 
        updatedAt: new Date().toISOString() 
      }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (!showRead && notification.read) return false;
    
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'transactions':
        return notification.type === 'transaction_update';
      case 'system':
        return notification.type === 'system';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-x-hidden container mx-auto px-4 py-6 max-w-screen-md pb-mobile-content ${bottomNavClass}`}>
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-green-600" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Stay updated with your harvest activities and market alerts
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRead(!showRead)}
          >
            {showRead ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showRead ? 'Hide Read' : 'Show Read'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'transactions', label: 'Transactions', count: notifications.filter(n => n.type === 'transaction_update').length },
          { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
        ].map(({ key, label, count }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="relative"
          >
            {label}
            {count > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </h3>
                <p className="text-gray-400 text-center">
                  {filter === 'unread' 
                    ? 'You\'re all caught up!' 
                    : 'You\'ll see notifications about bids, harvests, and market updates here.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.read ? 'ring-2 ring-green-200' : ''
                  } ${getNotificationColor(notification.type)}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-semibold break-words ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 break-words">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {notification.data.harvestId && (
                                <span className="flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  Harvest #{notification.data.harvestId.slice(-6)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.read && (
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsPage;
