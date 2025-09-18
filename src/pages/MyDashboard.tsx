import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBottomNav } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Star, 
  CheckCircle,
  AlertCircle,
  Eye,
  Heart,
  MessageSquare,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Harvest, Transaction, DashboardStats, ProductCategory } from '@/types/markit';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';

const MyDashboard = () => {
  const { user } = useAuth();
  const { bottomNavClass } = useBottomNav();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalHarvests: 0,
    activeHarvests: 0,
    totalTransactions: 0,
    totalEarnings: 0,
    averageRating: 0,
    recentActivity: []
  });

  const [allHarvests, setAllHarvests] = useState<Harvest[]>([]);
  const [filteredHarvests, setFilteredHarvests] = useState<Harvest[]>([]);
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMyDashboardData();
  }, [user]);

  useEffect(() => {
    filterHarvests();
  }, [allHarvests, searchTerm]);

  const filterHarvests = () => {
    let filtered = allHarvests;

    // Filter by search term (title, description, subcategory)
    if (searchTerm) {
      filtered = filtered.filter(harvest => 
        harvest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        harvest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        harvest.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHarvests(filtered);
  };

  const loadMyDashboardData = async () => {
    setLoading(true);
    
    try {
      // Fetch harvests from Firestore
      const harvestsQuery = query(
        collection(db, 'harvests'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const harvestsSnapshot = await getDocs(harvestsQuery);
      const harvestsData = harvestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Harvest[];

      setAllHarvests(harvestsData);

      // Update stats based on user's harvests
      const userHarvests = harvestsData.filter(harvest => harvest.farmerId === user?.id);
      setStats({
        totalHarvests: userHarvests.length,
        activeHarvests: userHarvests.filter(h => h.status === 'available').length,
        totalTransactions: 0, // TODO: Implement transactions
        totalEarnings: 0, // TODO: Implement earnings calculation
        averageRating: 4.8, // TODO: Implement rating system
        recentActivity: [
          { type: 'harvest', description: 'New harvest posted', timestamp: 'Just now' }
        ]
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalHarvests}</div>
                <p className="text-xs text-muted-foreground">
                  Total posted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeHarvests}</div>
                <p className="text-xs text-muted-foreground">
                  Available for sale
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
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
                  {filteredHarvests.map((harvest) => (
                    <Card key={harvest.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{harvest.title}</CardTitle>
                            <CardDescription className="text-sm">
                              by {harvest.farmerId === user?.id ? 'You' : harvest.farmerName}
                            </CardDescription>
                            {harvest.farmerId === user?.id && (
                              <Badge variant="outline" className="mt-1 text-green-600 border-green-600">
                                Your Post
                              </Badge>
                            )}
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
                            <span className="font-medium">₱{harvest.basePrice}/{harvest.quantity.unit}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium">{harvest.location.address}</span>
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
                            // Other user's harvest - show viewing options
                            <>
                              <Button asChild size="sm" variant="outline" className="flex-1">
                                <Link to={`/harvest/${harvest.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </Button>
                              <Button asChild size="sm" variant="default" className="flex-1">
                                <Link to={`/harvest/${harvest.id}`}>
                                  Purchase
                                </Link>
                              </Button>
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
              </CardTitle>
              <CardDescription>Browse all harvests from farmers and fisherfolk</CardDescription>
              {/* Search Bar */}
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products, farmers, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHarvests.map((harvest) => (
                    <Card key={harvest.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{harvest.title}</CardTitle>
                            <CardDescription className="text-sm">
                              by {harvest.farmerId === user?.id ? 'You' : harvest.farmerName}
                            </CardDescription>
                            {harvest.farmerId === user?.id && (
                              <Badge variant="outline" className="mt-1 text-green-600 border-green-600">
                                Your Post
                              </Badge>
                            )}
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
                            <span className="font-medium">₱{harvest.basePrice}/{harvest.quantity.unit}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium">{harvest.location.address}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link to={`/harvest/${harvest.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="default" className="flex-1">
                            <Link to={`/harvest/${harvest.id}`}>
                              Purchase
                            </Link>
                          </Button>
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

    return null;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-green-100 overflow-x-hidden ${bottomNavClass}`}>
      <div className="container mx-auto max-w-screen-md px-4 sm:px-5 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-mobile-content">
        {/* Welcome Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            {t('mydashboard_title') || 'My Dashboard'}
          </h1>
          <p className="text-lg text-green-600">
            {user?.role === 'farmer' && 'Track your harvests, earnings, and sales performance'}
            {user?.role === 'fisherman' && 'Track your catch, earnings, and sales performance'}
            {user?.role === 'buyer' && 'Manage your orders and purchase history'}
            {user?.role === 'admin' && 'Monitor platform activity and user management'}
          </p>
        </div>

        {/* Location Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-white border-green-300 text-green-700 px-4 py-2 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{user?.location?.city || (t('location_not_set') || 'Location not set')}</span>
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
