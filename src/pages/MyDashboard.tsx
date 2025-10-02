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
    if (user?.role === 'producer') {
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

          </div>

          {/* All Harvests (Mixed) */}
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>All Harvests</span>
                <Button asChild size="sm">
                  <Link to="/create-harvest">
                    <Plus className="h-4 w-4 mr-2" />
                    New Harvest
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
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

    if (user?.role === 'consumer') {
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

          </div>

          {/* Personalized content placeholder */}
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="text-center py-8 px-0">
              <h3 className="text-lg font-medium mb-2">Personalized Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                Your personalized content (recently viewed, saved listings, and recommendations) will appear here.
              </p>
              <Button asChild>
                <Link to="/">Go to Main Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-green-100 overflow-x-hidden ${bottomNavClass}`}>
      <div className="container mx-auto max-w-screen-md px-4 sm:px-5 py-2 sm:py-4 space-y-4 sm:space-y-6 pb-mobile-content">

        {/* Role-based Content */}
        {getRoleBasedContent()}

        {/* Recent Activity */}
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
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
