import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBottomNav } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Star, 
  CheckCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Package,
  User,
  Calendar,
  Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Harvest, Transaction, DashboardStats, ProductCategory } from '@/types/markit';
import { useIsMobile } from '@/hooks/use-mobile';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';

const Dashboard = () => {
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const isMobile = useIsMobile();

  const mockTitles = ['Fresh Organic', 'High-Quality', 'Locally Grown', 'Newly Harvested', 'Premium Grade'];
  const mockSubs = ['Rice', 'Corn', 'Coconut', 'Banana', 'Vegetables', 'Fish'];
  const mockBarangays = ['Barangay 1 (Poblacion)', 'Barangay 2 (Poblacion)', 'Aroganga', 'Buenavista', 'Rizal', 'San Vicente'];
  const mockUnits = ['kg', 'bags', 'crates'];

  const generateMockHarvests = (count: number): Harvest[] => {
    const items: Harvest[] = [];
    for (let i = 0; i < count; i++) {
      const sub = mockSubs[Math.floor(Math.random() * mockSubs.length)] as any;
      const titlePrefix = mockTitles[Math.floor(Math.random() * mockTitles.length)];
      const unit = mockUnits[Math.floor(Math.random() * mockUnits.length)];
      const barangay = mockBarangays[Math.floor(Math.random() * mockBarangays.length)];
      const amount = Math.floor(Math.random() * 900) + 100;
      const price = Math.floor(Math.random() * 40) + 10;
      items.push({
        id: `mock-${Date.now()}-${i}`,
        farmerId: `farmer-mock-${i}`,
        farmerName: ['Juan Dela Cruz', 'Maria Santos', 'Pedro Ramos', 'Ana Reyes'][i % 4],
        title: `${titlePrefix} ${sub}`,
        description: `Sample ${sub.toLowerCase()} from Dolores, Eastern Samar. Mock listing for demo on homepage.`,
        category: (['agricultural', 'fisheries'] as any)[sub === 'Fish' ? 1 : 0],
        subcategory: sub,
        quantity: { amount, unit },
        quality: { grade: (['A', 'B', 'Premium'] as any)[i % 3], freshness: 'fresh', organic: i % 2 === 0, certifications: [] },
        images: [],
        harvestDate: new Date(Date.now() - Math.floor(Math.random() * 5) * 86400000).toISOString(),
        status: 'available',
        basePrice: price,
        location: { address: `${barangay}, Dolores, Eastern Samar`, coordinates: { lat: 0, lng: 0 } },
        deliveryOptions: { pickup: true, delivery: i % 3 === 0 }
      } as Harvest);
    }
    return items;
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  useEffect(() => {
    filterHarvests();
  }, [allHarvests, searchTerm, selectedCategory, selectedLocation]);

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

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(harvest => harvest.category === selectedCategory);
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(harvest => 
        harvest.location.address.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredHarvests(filtered);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      // Fetch harvests from Firestore
      const harvestsQuery = query(
        collection(db, 'harvests'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const harvestsSnapshot = await getDocs(harvestsQuery);
      const harvestsData = harvestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Harvest[];

      // Combine fetched with mock data to enrich homepage
      const extra = generateMockHarvests(24);
      setAllHarvests([...harvestsData, ...extra]);

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
      // Fallback: show mock harvests so consumer mode always has content
      const extra = generateMockHarvests(24);
      setAllHarvests(extra);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBasedContent = () => {
    if (user?.role === 'producer') {
      return (
        <div className="space-y-6">
          {/* Quick stats removed on homepage */}

          {/* All Harvests (Mixed) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('home_all_harvests') || 'All Harvests'}</span>
                <Button asChild size="sm">
                  <Link to="/create-harvest">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('home_new_harvest') || 'New Harvest'}
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>{t('home_all_harvests_desc') || 'Browse all harvests from you and other farmers'}</CardDescription>
            </CardHeader>
            <CardContent>
              

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredHarvests.map((harvest) => (
                    <Card key={harvest.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative">
                        {harvest.images && harvest.images.length > 0 ? (
                          <img
                            src={harvest.images[0]}
                            alt={harvest.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                            {harvest.quality.grade}
                          </Badge>
                        </div>
                        {harvest.farmerId === user?.id && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                              {t('your_post') || 'Your Post'}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{harvest.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{harvest.description}</p>
                          
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{harvest.farmerId === user?.id ? (t('you') || 'You') : harvest.farmerName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{harvest.location.address}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">Harvested: {new Date(harvest.harvestDate).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              <span className="font-semibold text-base sm:text-lg text-green-600">
                                ₱{harvest.basePrice}
                              </span>
                              <span className="text-xs sm:text-sm text-muted-foreground">/{harvest.quantity.unit}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{harvest.quantity.amount} {harvest.quantity.unit}</Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {harvest.subcategory}
                            </Badge>
                            {harvest.quality.organic && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Organic
                              </Badge>
                            )}
                            {harvest.quality.certifications.slice(0, 2).map((cert, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Truck className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">
                              {harvest.deliveryOptions.pickup && harvest.deliveryOptions.delivery
                                ? 'Pickup & Delivery'
                                : harvest.deliveryOptions.pickup
                                ? 'Pickup Only'
                                : 'Delivery Only'}
                            </span>
                        </div>
                          
                          <div className="flex gap-2 mt-3">
                          {harvest.farmerId === user?.id ? (
                            // User's own harvest - show management options
                            <>
                                <Button asChild size="sm" variant="outline" className="flex-1">
                                <Link to={`/harvest/${harvest.id}`}>
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">{t('view_details') || 'View Details'}</span>
                                    <span className="sm:hidden">{t('view') || 'View'}</span>
                                </Link>
                              </Button>
                                <Button asChild size="sm" className="flex-1">
                                <Link to={`/harvest/${harvest.id}/edit`}>
                                    <span className="text-xs sm:text-sm">{t('edit') || 'Edit'}</span>
                                </Link>
                              </Button>
                            </>
                          ) : (
                            // Other user's harvest - show viewing options
                            <>
                                <Button asChild size="sm" variant="outline" className="flex-1">
                                <Link to={`/harvest/${harvest.id}`}>
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">{t('view_details') || 'View Details'}</span>
                                    <span className="sm:hidden">{t('view') || 'View'}</span>
                                </Link>
                              </Button>
                                <Button asChild size="sm" className="flex-1">
                                <Link to={`/harvest/${harvest.id}`}>
                                    <span className="text-xs sm:text-sm">{t('purchase') || 'Purchase'}</span>
                                </Link>
                              </Button>
                            </>
                          )}
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

    if (user?.role === 'consumer') {
      return (
        <div className="space-y-6">
          {/* Quick stats removed on homepage */}

          {/* All Harvests (Mixed) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('home_all_harvests') || 'All Harvests'}</span>
              </CardTitle>
              <CardDescription>{t('home_all_harvests_buyer_desc') || 'Browse all harvests from farmers and fisherfolk'}</CardDescription>
              {/* Search Bar removed from homepage (search available in Search menu) */}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredHarvests.map((harvest) => (
                    <Card key={harvest.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative">
                        {harvest.images && harvest.images.length > 0 ? (
                          <img
                            src={harvest.images[0]}
                            alt={harvest.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                            {harvest.quality.grade}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{harvest.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{harvest.description}</p>
                          
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{harvest.farmerName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{harvest.location.address}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">Harvested: {new Date(harvest.harvestDate).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              <span className="font-semibold text-base sm:text-lg text-green-600">
                                ₱{harvest.basePrice}
                              </span>
                              <span className="text-xs sm:text-sm text-muted-foreground">/{harvest.quantity.unit}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{harvest.quantity.amount} {harvest.quantity.unit}</Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {harvest.subcategory}
                            </Badge>
                            {harvest.quality.organic && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Organic
                              </Badge>
                            )}
                            {harvest.quality.certifications.slice(0, 2).map((cert, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Truck className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">
                              {harvest.deliveryOptions.pickup && harvest.deliveryOptions.delivery
                                ? 'Pickup & Delivery'
                                : harvest.deliveryOptions.pickup
                                ? 'Pickup Only'
                                : 'Delivery Only'}
                            </span>
                        </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link to={`/harvest/${harvest.id}`}>
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">{t('view_details') || 'View Details'}</span>
                                <span className="sm:hidden">{t('view') || 'View'}</span>
                            </Link>
                          </Button>
                            <Button asChild size="sm" className="flex-1">
                            <Link to={`/harvest/${harvest.id}`}>
                                <span className="text-xs sm:text-sm">{t('purchase') || 'Purchase'}</span>
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
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-green-100 overflow-x-hidden ${bottomNavClass}`}>
      <div className="container mx-auto max-w-screen-md px-4 sm:px-5 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-mobile-content">
        {/* Welcome Header */}
        <div className="text-center py-4 sm:py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-2">
            {t('welcome_title') || 'Welcome to MarkIt'}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-green-600 px-4">
            {user?.role === 'producer' && (t('welcome_producer') || 'Connect directly with consumers and get fair prices for your harvest')}
            {user?.role === 'consumer' && (t('welcome_consumer') || 'Discover fresh harvests from local producers')}
            {user?.role === 'admin' && (t('welcome_admin') || 'Monitor platform activity and user management')}
          </p>
        </div>

        {/* Location Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-white border-green-300 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="truncate max-w-[200px] sm:max-w-none">{user?.location?.city || user?.location?.address || 'Location not set'}</span>
          </Badge>
        </div>

        {/* Role-based Content */}
        {getRoleBasedContent()}

        {/* Recent Activity removed on homepage */}
      </div>
    </div>
  );
};

export default Dashboard;
