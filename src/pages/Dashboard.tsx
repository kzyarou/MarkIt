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
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Harvest, Transaction, Bid, DashboardStats } from '@/types/markit';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
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

  const [recentHarvests, setRecentHarvests] = useState<Harvest[]>([]);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [allHarvests, setAllHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch dashboard data from Firebase
    // This would be replaced with actual API calls
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
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

    // Mock harvests from current user and other users mixed together
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
    setLoading(false);
  };

  const getRoleBasedContent = () => {
    if (user?.role === 'farmer' || user?.role === 'fisherman') {
      return (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Harvests</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeHarvests}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalHarvests} total harvests
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
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating}</div>
                <p className="text-xs text-muted-foreground">
                  Based on buyer reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest harvests and transactions</CardDescription>
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild className="h-20">
              <Link to="/create-harvest">
                <Plus className="mr-2 h-5 w-5" />
                Post New Harvest
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20">
              <Link to="/my-harvests">
                <Package className="mr-2 h-5 w-5" />
                Manage Harvests
              </Link>
            </Button>
          </div>
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
                <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBids}</div>
                <p className="text-xs text-muted-foreground">
                  Pending responses
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
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
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

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest bids and purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild className="h-20">
              <Link to="/marketplace">
                <Search className="mr-2 h-5 w-5" />
                Browse Marketplace
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20">
              <Link to="/my-bids">
                <Clock className="mr-2 h-5 w-5" />
                My Bids
              </Link>
            </Button>
          </div>
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
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-green-600">
            {user?.role === 'farmer' && 'Manage your harvests and track your sales'}
            {user?.role === 'fisherman' && 'Manage your catch and track your sales'}
            {user?.role === 'buyer' && 'Find fresh produce and place your bids'}
            {user?.role === 'admin' && 'Monitor the platform and manage users'}
          </p>
        </div>

        {/* Location Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-white border-green-300 text-green-700 px-4 py-2 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{user?.location?.city || 'Unknown'}</span>
          </Badge>
        </div>

        {/* POSTS Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-800 mb-2">POSTS</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allHarvests.map((harvest) => (
                <Card key={harvest.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-green-800 mb-1">{harvest.title}</CardTitle>
                        <CardDescription className="text-sm text-green-600">
                          by {harvest.farmerId === user?.id ? 'You' : harvest.farmerName}
                          {harvest.farmerId === user?.id && (
                            <Badge variant="outline" className="ml-2 text-green-600 border-green-600 bg-green-50">
                              Your Post
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {harvest.quality.grade}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {harvest.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Quantity:</span>
                        <span className="font-semibold text-green-700">{harvest.quantity.amount} {harvest.quantity.unit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Base Price:</span>
                        <span className="font-semibold text-green-700">₱{harvest.basePrice}/kg</span>
                      </div>
                      {harvest.currentHighestBid && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Highest Bid:</span>
                          <span className="font-semibold text-green-600">₱{harvest.currentHighestBid}/kg</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Location:</span>
                        <span className="font-medium text-gray-700">{harvest.location.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Ends:</span>
                        <span className="font-medium text-gray-700">
                          {new Date(harvest.biddingEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      {harvest.farmerId === user?.id ? (
                        // User's own harvest - show management options
                        <>
                          <Button asChild size="sm" variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50">
                            <Link to={`/harvest/${harvest.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                            <Link to={`/harvest/${harvest.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </>
                      ) : (
                        // Other user's harvest - show bidding options
                        <>
                          <Button asChild size="sm" variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50">
                            <Link to={`/harvest/${harvest.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                          {user?.role === 'buyer' && (
                            <Button asChild size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                              <Link to={`/bidding/${harvest.id}`}>
                                Place Bid
                              </Link>
                            </Button>
                          )}
                        </>
                      )}
                      {harvest.quality.organic && (
                        <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                          Organic
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;