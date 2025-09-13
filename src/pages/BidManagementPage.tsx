import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle,
  XCircle,
  DollarSign,
  Package,
  User,
  Calendar,
  Eye,
  MessageCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bid, Harvest } from '@/types/markit';

const BidManagementPage = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [harvests, setHarvests] = useState<Record<string, Harvest>>({});
  const [filteredBids, setFilteredBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadBids();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bids, searchQuery, statusFilter]);

  const loadBids = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Firebase queries
      const mockBids: Bid[] = [
        {
          id: '1',
          harvestId: 'harvest1',
          buyerId: user?.id || 'buyer1',
          buyerName: user?.name || 'You',
          amount: 52,
          totalAmount: 2600,
          quantity: 50,
          message: 'We need fresh tomatoes for our daily operations. Can deliver today?',
          status: 'active',
          isAutoBid: false,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          harvestId: 'harvest2',
          buyerId: user?.id || 'buyer1',
          buyerName: user?.name || 'You',
          amount: 48,
          totalAmount: 2400,
          quantity: 50,
          message: 'For our school feeding program. Prefer organic produce.',
          status: 'accepted',
          isAutoBid: true,
          maxBidAmount: 55,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          harvestId: 'harvest3',
          buyerId: user?.id || 'buyer1',
          buyerName: user?.name || 'You',
          amount: 120,
          totalAmount: 3600,
          quantity: 30,
          message: 'Fresh fish for our restaurant. Need delivery by tomorrow.',
          status: 'rejected',
          isAutoBid: false,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          harvestId: 'harvest4',
          buyerId: user?.id || 'buyer1',
          buyerName: user?.name || 'You',
          amount: 35,
          totalAmount: 3500,
          quantity: 100,
          message: 'Bulk purchase for our cooperative. Can pickup this week.',
          status: 'expired',
          isAutoBid: false,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const mockHarvests: Record<string, Harvest> = {
        'harvest1': {
          id: 'harvest1',
          farmerId: 'farmer1',
          farmerName: 'Juan Dela Cruz',
          title: 'Fresh Organic Tomatoes',
          description: 'Freshly harvested organic tomatoes from our farm.',
          category: 'agricultural',
          subcategory: 'Vegetables',
          quantity: { amount: 50, unit: 'kg' },
          quality: {
            grade: 'A',
            freshness: 'fresh',
            organic: true,
            certifications: ['Organic', 'Non-GMO']
          },
          images: [],
          harvestDate: new Date().toISOString(),
          status: 'available',
          basePrice: 45,
          currentHighestBid: 52,
          biddingEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          location: {
            address: 'Barangay San Jose, Nueva Ecija',
            coordinates: { lat: 15.5, lng: 121.0 }
          },
          deliveryOptions: {
            pickup: true,
            delivery: true,
            deliveryRadius: 50,
            deliveryFee: 200
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        'harvest2': {
          id: 'harvest2',
          farmerId: 'farmer2',
          farmerName: 'Maria Santos',
          title: 'Premium Rice - Jasmine',
          description: 'High-quality jasmine rice from our rice fields.',
          category: 'agricultural',
          subcategory: 'Rice',
          quantity: { amount: 100, unit: 'kg' },
          quality: {
            grade: 'Premium',
            freshness: 'dried',
            organic: true,
            certifications: ['Organic', 'Fair Trade']
          },
          images: [],
          harvestDate: new Date().toISOString(),
          status: 'sold',
          basePrice: 35,
          currentHighestBid: 48,
          biddingEndDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: {
            address: 'Barangay Maligaya, Isabela',
            coordinates: { lat: 16.7, lng: 121.8 }
          },
          deliveryOptions: {
            pickup: true,
            delivery: true,
            deliveryRadius: 100,
            deliveryFee: 300
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        'harvest3': {
          id: 'harvest3',
          farmerId: 'farmer3',
          farmerName: 'Pedro Garcia',
          title: 'Fresh Tilapia Fish',
          description: 'Fresh tilapia from our fishpond.',
          category: 'fisheries',
          subcategory: 'Fish',
          quantity: { amount: 30, unit: 'kg' },
          quality: {
            grade: 'A',
            freshness: 'fresh',
            organic: false,
            certifications: ['HACCP']
          },
          images: [],
          harvestDate: new Date().toISOString(),
          status: 'sold',
          basePrice: 120,
          currentHighestBid: 125,
          biddingEndDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: {
            address: 'Barangay Poblacion, Laguna',
            coordinates: { lat: 14.2, lng: 121.3 }
          },
          deliveryOptions: {
            pickup: true,
            delivery: false
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        'harvest4': {
          id: 'harvest4',
          farmerId: 'farmer4',
          farmerName: 'Ana Rodriguez',
          title: 'Fresh Vegetables Mix',
          description: 'Mixed vegetables from our organic farm.',
          category: 'agricultural',
          subcategory: 'Vegetables',
          quantity: { amount: 100, unit: 'kg' },
          quality: {
            grade: 'A',
            freshness: 'fresh',
            organic: true,
            certifications: ['Organic']
          },
          images: [],
          harvestDate: new Date().toISOString(),
          status: 'expired',
          basePrice: 30,
          currentHighestBid: 0,
          biddingEndDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          location: {
            address: 'Barangay Green Valley, Benguet',
            coordinates: { lat: 16.4, lng: 120.6 }
          },
          deliveryOptions: {
            pickup: true,
            delivery: true,
            deliveryRadius: 75,
            deliveryFee: 250
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      setBids(mockBids);
      setHarvests(mockHarvests);
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bids];

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(bid =>
        bid.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.harvestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (harvests[bid.harvestId]?.title.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bid => bid.status === statusFilter);
    }

    setFilteredBids(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'withdrawn': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'expired': return <Clock className="h-4 w-4" />;
      case 'withdrawn': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getBidStats = () => {
    const stats = {
      total: bids.length,
      active: bids.filter(b => b.status === 'active').length,
      accepted: bids.filter(b => b.status === 'accepted').length,
      rejected: bids.filter(b => b.status === 'rejected').length,
      totalValue: bids.reduce((sum, b) => sum + b.totalAmount, 0)
    };
    return stats;
  };

  const stats = getBidStats();

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
        <h1 className="text-3xl font-bold">My Bids</h1>
        <p className="text-muted-foreground">
          Track and manage your bids on harvests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bids</p>
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
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">₱{stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
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
              placeholder="Search bids..."
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
            <option value="active">Active</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.map((bid) => {
          const harvest = harvests[bid.harvestId];
          if (!harvest) return null;

          return (
            <Card key={bid.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">{harvest.title}</h3>
                          <Badge className={getStatusColor(bid.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(bid.status)}
                              <span className="capitalize">{bid.status}</span>
                            </div>
                          </Badge>
                          {bid.isAutoBid && (
                            <Badge variant="outline" className="text-xs">
                              Auto-bid
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {harvest.subcategory} • {harvest.farmerName}
                        </p>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {bid.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(bid.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{getTimeRemaining(harvest.biddingEndDate)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold">₱{bid.amount}/{harvest.quantity.unit}</div>
                          <div className="text-sm text-muted-foreground">
                            {bid.quantity} {harvest.quantity.unit} • ₱{bid.totalAmount.toLocaleString()} total
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/harvest/${harvest.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    {bid.status === 'active' && (
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    )}
                    {bid.status === 'accepted' && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBids.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No bids found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria.'
              : 'You haven\'t placed any bids yet.'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button asChild>
              <Link to="/marketplace">
                Browse Marketplace
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BidManagementPage;




