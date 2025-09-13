import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users, 
  MapPin, 
  Star,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Heart,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Harvest, Transaction, Bid, DashboardStats } from '@/types/markit';

const MyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalHarvests: 0,
    activeHarvests: 0,
    totalBids: 0,
    totalTransactions: 0,
    totalEarnings: 0,
    averageRating: 0,
    recentActivity: []
  });

  const [allHarvests, setAllHarvests] = useState<Harvest[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyDashboardData();
  }, [user]);

  const loadMyDashboardData = async () => {
    setLoading(true);
    // Mock data for now - replace with actual Firebase queries
    setStats({
      totalHarvests: 12,
      activeHarvests: 3,
      totalBids: 8,
      totalTransactions: 5,
      totalEarnings: 15750,
      averageRating: 4.8,
      recentActivity: [
        { type: 'harvest', description: 'New rice harvest posted', timestamp: '2 hours ago' },
        { type: 'bid', description: 'Received bid for tomatoes', timestamp: '4 hours ago' },
        { type: 'transaction', description: 'Sale completed - 50kg fish', timestamp: '1 day ago' }
      ]
    });

    // Mock harvests from current user and other users mixed together (same as homepage)
    const currentUserHarvests = user?.role === 'farmer' || user?.role === 'fisherman' ? [
      {
        id: 'my1',
        farmerId: user?.id || 'current-user',
        farmerName: user?.name || 'You',
        title: 'Premium Organic Rice',
        description: 'High-quality organic rice from my farm. No pesticides used.',
        category: 'agricultural',
        subcategory: 'Rice',
        quantity: { amount: 50, unit: 'kg' },
        quality: { grade: 'A', freshness: 'fresh', organic: true, certifications: ['Organic'] },
        basePrice: 50,
        currentHighestBid: 65,
        biddingEndDate: '2024-01-20T18:00:00Z',
        status: 'available',
        location: { address: user?.location?.address || 'Your Location', coordinates: { lat: 0, lng: 0 } },
        images: [],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'my2',
        farmerId: user?.id || 'current-user',
        farmerName: user?.name || 'You',
        title: 'Fresh Tilapia',
        description: 'Freshly caught tilapia from clean waters.',
        category: 'fisheries',
        subcategory: 'Tilapia',
        quantity: { amount: 30, unit: 'kg' },
        quality: { grade: 'A', freshness: 'fresh', organic: false, certifications: [] },
        basePrice: 130,
        currentHighestBid: 145,
        biddingEndDate: '2024-01-18T20:00:00Z',
        status: 'available',
        location: { address: user?.location?.address || 'Your Location', coordinates: { lat: 0, lng: 0 } },
        images: [],
        createdAt: '2024-01-14T14:30:00Z',
        updatedAt: '2024-01-14T14:30:00Z'
      }
    ] : [];

    const otherUsersHarvests = [
      {
        id: '1',
        farmerId: 'farmer1',
        farmerName: 'Juan Dela Cruz',
        title: 'Fresh Organic Rice',
        description: 'Premium quality organic rice harvested this week. No pesticides used.',
        category: 'agricultural',
        subcategory: 'Rice',
        quantity: { amount: 100, unit: 'kg' },
        quality: { grade: 'A', freshness: 'fresh', organic: true, certifications: ['Organic'] },
        basePrice: 45,
        currentHighestBid: 52,
        biddingEndDate: '2024-01-15T18:00:00Z',
        status: 'available',
        location: { address: 'Nueva Ecija, Philippines', coordinates: { lat: 15.5, lng: 121.0 } },
        images: [],
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        farmerId: 'farmer2',
        farmerName: 'Maria Santos',
        title: 'Fresh Tilapia',
        description: 'Freshly caught tilapia from clean waters. Perfect for restaurants.',
        category: 'fisheries',
        subcategory: 'Tilapia',
        quantity: { amount: 50, unit: 'kg' },
        quality: { grade: 'A', freshness: 'fresh', organic: false, certifications: [] },
        basePrice: 120,
        currentHighestBid: 135,
        biddingEndDate: '2024-01-12T20:00:00Z',
        status: 'available',
        location: { address: 'Laguna, Philippines', coordinates: { lat: 14.3, lng: 121.4 } },
        images: [],
        createdAt: '2024-01-09T14:30:00Z',
        updatedAt: '2024-01-09T14:30:00Z'
      },
      {
        id: '3',
        farmerId: 'farmer3',
        farmerName: 'Pedro Garcia',
        title: 'Organic Tomatoes',
        description: 'Fresh organic tomatoes grown without chemicals. Perfect for salads.',
        category: 'agricultural',
        subcategory: 'Tomatoes',
        quantity: { amount: 25, unit: 'kg' },
        quality: { grade: 'Premium', freshness: 'fresh', organic: true, certifications: ['Organic'] },
        basePrice: 80,
        currentHighestBid: 95,
        biddingEndDate: '2024-01-14T16:00:00Z',
        status: 'available',
        location: { address: 'Benguet, Philippines', coordinates: { lat: 16.4, lng: 120.6 } },
        images: [],
        createdAt: '2024-01-08T09:15:00Z',
        updatedAt: '2024-01-08T09:15:00Z'
      }
    ];

    // Mix current user's harvests with other users' harvests
    const mixedHarvests = [...currentUserHarvests, ...otherUsersHarvests];
    setAllHarvests(mixedHarvests);

    // Mock user's bids
    setMyBids([
      {
        id: 'bid1',
        harvestId: 'harvest1',
        buyerId: user?.id || 'current-user',
        buyerName: user?.name || 'You',
        buyerBusinessType: 'restaurant',
        amount: 55,
        totalAmount: 2750,
        quantity: 50,
        message: 'Interested in bulk purchase for my restaurant',
        status: 'active',
        isAutoBid: false,
        createdAt: '2024-01-16T09:00:00Z',
        updatedAt: '2024-01-16T09:00:00Z'
      }
    ]);

    setLoading(false);
  };

  const getRoleBasedContent = () => {
    if (user?.role === 'farmer' || user?.role === 'fisherman') {
      return (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Harvests</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalHarvests}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeHarvests} currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{stats.totalEarnings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  From {stats.totalTransactions} sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating}</div>
                <p className="text-xs text-muted-foreground">
                  Based on buyer reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBids}</div>
                <p className="text-xs text-muted-foreground">
                  On my harvests
                </p>
              </CardContent>
            </Card>
          </div>

          {/* All Harvests (Mixed) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Harvests</span>
                <Button asChild size="sm">
                  <Link to="/create-harvest">
                    <Plus className="h-4 w-4 mr-2" />
                    New Harvest
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>Browse all harvests from you and other farmers</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allHarvests.map((harvest) => (
                    <Card key={harvest.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{harvest.title}</CardTitle>
                            <CardDescription className="text-sm">
                              by {harvest.farmerId === user?.id ? 'You' : harvest.farmerName}
                              {harvest.farmerId === user?.id && (
                                <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                                  Your Post
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                          <Badge variant={harvest.quality.grade === 'Premium' ? 'default' : 'secondary'}>
                            {harvest.quality.grade}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {harvest.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Quantity:</span>
                            <span className="font-medium">{harvest.quantity.amount} {harvest.quantity.unit}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Base Price:</span>
                            <span className="font-medium">₱{harvest.basePrice}/kg</span>
                          </div>
                          {harvest.currentHighestBid && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Highest Bid:</span>
                              <span className="font-medium text-green-600">₱{harvest.currentHighestBid}/kg</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium">{harvest.location.address}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Ends:</span>
                            <span className="font-medium">
                              {new Date(harvest.biddingEndDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                          {harvest.farmerId === user?.id ? (
                            // User's own harvest - show management options
                            <>
                              <Button asChild size="sm" variant="outline" className="flex-1">
                                <Link to={`/harvest/${harvest.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </Button>
                              <Button asChild size="sm" className="flex-1">
                                <Link to={`/harvest/${harvest.id}/edit`}>
                                  Edit
                                </Link>
                              </Button>
                            </>
                          ) : (
                            // Other user's harvest - show bidding options
                            <>
                              <Button asChild size="sm" className="flex-1">
                                <Link to={`/harvest/${harvest.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </Button>
                              {user?.role === 'buyer' && (
                                <Button asChild size="sm" variant="default" className="flex-1">
                                  <Link to={`/bidding/${harvest.id}`}>
                                    Place Bid
                                  </Link>
                                </Button>
                              )}
                            </>
                          )}
                          {harvest.quality.organic && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Organic
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (user?.role === 'buyer') {
      return (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Bids</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBids}</div>
                <p className="text-xs text-muted-foreground">
                  Active bids
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  Successful purchases
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{stats.totalEarnings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating}</div>
                <p className="text-xs text-muted-foreground">
                  Buyer rating
                </p>
              </CardContent>
            </Card>
          </div>

          {/* All Harvests (Mixed) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Harvests</span>
                <Button asChild size="sm">
                  <Link to="/marketplace">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Market
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>Browse all harvests from farmers and fisherfolk</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allHarvests.map((harvest) => (
                    <Card key={harvest.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{harvest.title}</CardTitle>
                            <CardDescription className="text-sm">
                              by {harvest.farmerId === user?.id ? 'You' : harvest.farmerName}
                              {harvest.farmerId === user?.id && (
                                <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                                  Your Post
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                          <Badge variant={harvest.quality.grade === 'Premium' ? 'default' : 'secondary'}>
                            {harvest.quality.grade}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {harvest.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Quantity:</span>
                            <span className="font-medium">{harvest.quantity.amount} {harvest.quantity.unit}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Base Price:</span>
                            <span className="font-medium">₱{harvest.basePrice}/kg</span>
                          </div>
                          {harvest.currentHighestBid && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Highest Bid:</span>
                              <span className="font-medium text-green-600">₱{harvest.currentHighestBid}/kg</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium">{harvest.location.address}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Ends:</span>
                            <span className="font-medium">
                              {new Date(harvest.biddingEndDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                          {harvest.farmerId === user?.id ? (
                            // User's own harvest - show management options
                            <>
                              <Button asChild size="sm" variant="outline" className="flex-1">
                                <Link to={`/harvest/${harvest.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </Button>
                              <Button asChild size="sm" className="flex-1">
                                <Link to={`/harvest/${harvest.id}/edit`}>
                                  Edit
                                </Link>
                              </Button>
                            </>
                          ) : (
                            // Other user's harvest - show bidding options
                            <>
                              <Button asChild size="sm" className="flex-1">
                                <Link to={`/harvest/${harvest.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </Button>
                              {user?.role === 'buyer' && (
                                <Button asChild size="sm" variant="default" className="flex-1">
                                  <Link to={`/bidding/${harvest.id}`}>
                                    Place Bid
                                  </Link>
                                </Button>
                              )}
                            </>
                          )}
                          {harvest.quality.organic && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Organic
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Bids */}
          <Card>
            <CardHeader>
              <CardTitle>My Bids</CardTitle>
              <CardDescription>Track your bids and purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBids.map((bid) => (
                    <Card key={bid.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">Bid on Fresh Produce</h3>
                              <Badge variant={bid.status === 'active' ? 'default' : 'secondary'}>
                                {bid.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{bid.message}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Bid Amount:</span>
                                <p className="font-medium">₱{bid.amount}/kg</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Quantity:</span>
                                <p className="font-medium">{bid.quantity} kg</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total:</span>
                                <p className="font-medium">₱{bid.totalAmount}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Placed:</span>
                                <p className="font-medium">
                                  {new Date(bid.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/bidding/${bid.harvestId}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="destructive">
                              <Link to={`/bids/${bid.id}/withdraw`}>
                                Withdraw
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Welcome Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            My Dashboard
          </h1>
          <p className="text-lg text-green-600">
            {user?.role === 'farmer' && 'Track your harvests, earnings, and sales performance'}
            {user?.role === 'fisherman' && 'Track your catch, earnings, and sales performance'}
            {user?.role === 'buyer' && 'Manage your bids, orders, and purchase history'}
            {user?.role === 'admin' && 'Monitor platform activity and user management'}
          </p>
        </div>

        {/* Location Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-white border-green-300 text-green-700 px-4 py-2 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{user?.location?.city || 'Location not set'}</span>
          </Badge>
        </div>

      {/* Role-based Content */}
      {getRoleBasedContent()}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest activities on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default MyDashboard;

