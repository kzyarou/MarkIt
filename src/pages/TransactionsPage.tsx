import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Package, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  Eye,
  MessageCircle
} from 'lucide-react';
import { Transaction, Harvest } from '@/types/markit';

const TransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, statusFilter]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Firebase query
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          harvestId: 'harvest1',
          farmerId: 'farmer1',
          buyerId: user?.id || 'buyer1',
          bidId: 'bid1',
          quantity: 50,
          unitPrice: 52,
          totalAmount: 2600,
          deliveryFee: 200,
          finalAmount: 2800,
          status: 'completed',
          paymentMethod: 'bank_transfer',
          paymentStatus: 'paid',
          deliveryAddress: {
            address: '123 Main St, City',
            coordinates: { lat: 14.5, lng: 121.0 },
            contactPerson: 'John Doe',
            phoneNumber: '+63 912 345 6789'
          },
          deliveryDate: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          harvestId: 'harvest2',
          farmerId: user?.id || 'farmer1',
          buyerId: 'buyer2',
          bidId: 'bid2',
          quantity: 30,
          unitPrice: 120,
          totalAmount: 3600,
          deliveryFee: 0,
          finalAmount: 3600,
          status: 'in_transit',
          paymentMethod: 'cash',
          paymentStatus: 'paid',
          deliveryAddress: {
            address: '456 Oak Ave, Town',
            coordinates: { lat: 14.6, lng: 121.1 },
            contactPerson: 'Jane Smith',
            phoneNumber: '+63 912 345 6788'
          },
          deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          harvestId: 'harvest3',
          farmerId: 'farmer3',
          buyerId: user?.id || 'buyer1',
          bidId: 'bid3',
          quantity: 25,
          unitPrice: 45,
          totalAmount: 1125,
          deliveryFee: 150,
          finalAmount: 1275,
          status: 'pending',
          paymentMethod: 'mobile_payment',
          paymentStatus: 'pending',
          deliveryAddress: {
            address: '789 Pine St, Village',
            coordinates: { lat: 14.7, lng: 121.2 },
            contactPerson: 'Bob Johnson',
            phoneNumber: '+63 912 345 6787'
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.harvestId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTransactionStats = () => {
    const stats = {
      total: transactions.length,
      completed: transactions.filter(t => t.status === 'completed').length,
      pending: transactions.filter(t => t.status === 'pending').length,
      inTransit: transactions.filter(t => t.status === 'in_transit').length,
      totalValue: transactions.reduce((sum, t) => sum + t.finalAmount, 0)
    };
    return stats;
  };

  const stats = getTransactionStats();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">
          Track your purchase and sales history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending + stats.inTransit}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">₱{stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold">Transaction #{transaction.id}</h3>
                        <Badge className={getStatusColor(transaction.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize">{transaction.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                        <Badge className={getPaymentStatusColor(transaction.paymentStatus)}>
                          {transaction.paymentStatus}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">
                        {transaction.quantity} units • {transaction.paymentMethod.replace('_', ' ')}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                        </div>
                        {transaction.deliveryAddress && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{transaction.deliveryAddress.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-muted-foreground">Unit Price:</span>
                        <span className="font-medium">₱{transaction.unitPrice}</span>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-medium">₱{transaction.totalAmount.toLocaleString()}</span>
                        {transaction.deliveryFee > 0 && (
                          <>
                            <span className="text-muted-foreground">Delivery:</span>
                            <span className="font-medium">₱{transaction.deliveryFee}</span>
                          </>
                        )}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        Final Amount: ₱{transaction.finalAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {transaction.status === 'pending' && (
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No transactions found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria.'
              : 'You haven\'t made any transactions yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;




