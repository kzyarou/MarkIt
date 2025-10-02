import React, { useState, useEffect, useMemo } from 'react';
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
import { getHistory, getSaved, getRecommendations } from '@/utils/userContent';

const Dashboard = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const isMobile = useIsMobile();
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);

  const mockTitles = ['Fresh Organic', 'High-Quality', 'Locally Grown', 'Newly Harvested', 'Premium Grade'];
  const mockSubs = ['Rice', 'Corn', 'Coconut', 'Banana', 'Vegetables', 'Fish'];
  const mockBarangays = ['Barangay 1 (Poblacion)', 'Barangay 2 (Poblacion)', 'Aroganga', 'Buenavista', 'Rizal', 'San Vicente'];
  const mockUnits = ['kg', 'bags', 'crates'];

  // Memoized mock harvests to avoid regenerating on every render
  const generateMockHarvests = React.useMemo(() => {
    return (count: number): Harvest[] => {
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
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  useEffect(() => {
    filterHarvests();
  }, [allHarvests, searchTerm, selectedCategory, selectedLocation]);

  // Memoize the personalized content to avoid unnecessary recalculations
  const personalizedContent = useMemo(() => {
    try {
      return {
        recentHistory: getHistory(user?.id),
        savedListings: getSaved(user?.id),
        recommended: getRecommendations(user?.id, allHarvests)
      };
    } catch (error) {
      console.error('Error loading personalized content:', error);
      return {
        recentHistory: [],
        savedListings: [],
        recommended: []
      };
    }
  }, [user?.id, allHarvests]);

  useEffect(() => {
    setRecentHistory(personalizedContent.recentHistory);
    setSavedListings(personalizedContent.savedListings);
    setRecommended(personalizedContent.recommended);
  }, [personalizedContent]);

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
    setError(null);
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      // Fetch harvests from Firestore with timeout
      const harvestsQuery = query(
        collection(db, 'harvests'),
        orderBy('createdAt', 'desc'),
        limit(50) // Reduced from 100 to improve performance
      );
      
      const harvestsPromise = getDocs(harvestsQuery);
      const harvestsSnapshot = await Promise.race([harvestsPromise, timeoutPromise]) as any;
      
      const harvestsData = harvestsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Harvest[];

      // Use fewer mock harvests for better performance
      const extra = generateMockHarvests(12); // Reduced from 24
      setAllHarvests([...harvestsData, ...extra]);

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

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      
      // Set appropriate error message
      if (error.message === 'Request timeout') {
        setError('Loading is taking longer than expected. Please check your connection.');
      } else if (error.code === 'permission-denied') {
        setError('Unable to load harvests. Please check your permissions.');
      } else if (error.code === 'unavailable') {
        setError('Service temporarily unavailable. Please try again later.');
      } else {
        setError('Failed to load harvests. Please refresh the page.');
      }
      
      // Fallback: show mock harvests so consumer mode always has content
      const extra = generateMockHarvests(12);
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
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{t('home_all_harvests') || 'All Harvests'}</span>
                <Button asChild size="sm">
                  <Link to="/create-harvest">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('home_new_harvest') || 'New Harvest'}
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              

              {loading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Loading harvests...
                  </div>
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
          {/* Recently Viewed */}
          {recentHistory && recentHistory.length > 0 && (
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg">Recently Viewed</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {recentHistory.slice(0, 6).map((harvest) => (
                    <Card key={`hist-${harvest.id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative">
                        {harvest.images && harvest.images.length > 0 ? (
                          <img src={harvest.images[0]} alt={harvest.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                          </div>
                        )}
                        {harvest.quality?.grade && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                              {harvest.quality.grade}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{harvest.title}</h3>
                          {harvest.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{harvest.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{harvest.farmerName || 'Seller'}</span>
                          </div>
                          {harvest.location?.address && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="line-clamp-1">{harvest.location.address}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              {typeof harvest.basePrice === 'number' && harvest.quantity?.unit ? (
                                <span className="font-semibold text-base sm:text-lg text-green-600">₱{harvest.basePrice}</span>
                              ) : (
                                <span className="text-xs sm:text-sm text-muted-foreground">Price varies</span>
                              )}
                              {harvest.quantity?.unit && (
                                <span className="text-xs sm:text-sm text-muted-foreground">/{harvest.quantity.unit}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button asChild size="sm" variant="outline" className="flex-1">
                              <Link to={`/harvest/${harvest.id}`}>
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">View</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Listings */}
          {savedListings && savedListings.length > 0 && (
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg">Saved Listings</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {savedListings.slice(0, 6).map((harvest) => (
                    <Card key={`saved-${harvest.id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative">
                        {harvest.images && harvest.images.length > 0 ? (
                          <img src={harvest.images[0]} alt={harvest.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                          </div>
                        )}
                        {harvest.quality?.grade && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                              {harvest.quality.grade}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{harvest.title}</h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{harvest.farmerName || 'Seller'}</span>
                          </div>
                          {harvest.location?.address && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="line-clamp-1">{harvest.location.address}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              {typeof harvest.basePrice === 'number' && harvest.quantity?.unit ? (
                                <span className="font-semibold text-base sm:text-lg text-green-600">₱{harvest.basePrice}</span>
                              ) : (
                                <span className="text-xs sm:text-sm text-muted-foreground">Price varies</span>
                              )}
                              {harvest.quantity?.unit && (
                                <span className="text-xs sm:text-sm text-muted-foreground">/{harvest.quantity.unit}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button asChild size="sm" variant="outline" className="flex-1">
                              <Link to={`/harvest/${harvest.id}`}>
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">View</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommended for You */}
          {recommended && recommended.length > 0 && (
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg">Recommended for You</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {recommended.slice(0, 6).map((harvest) => (
                    <Card key={`rec-${harvest.id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative">
                        {harvest.images && harvest.images.length > 0 ? (
                          <img src={harvest.images[0]} alt={harvest.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                          </div>
                        )}
                        {harvest.quality?.grade && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                              {harvest.quality.grade}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{harvest.title}</h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{harvest.farmerName || 'Seller'}</span>
                          </div>
                          {harvest.location?.address && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="line-clamp-1">{harvest.location.address}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              <span className="font-semibold text-base sm:text-lg text-green-600">₱{harvest.basePrice}</span>
                              <span className="text-xs sm:text-sm text-muted-foreground">/{harvest.quantity?.unit}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button asChild size="sm" variant="outline" className="flex-1">
                              <Link to={`/harvest/${harvest.id}`}>
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">View</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show message if no personalized content */}
          {(!recentHistory || recentHistory.length === 0) && 
           (!savedListings || savedListings.length === 0) && 
           (!recommended || recommended.length === 0) && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start exploring!</h3>
                <p className="text-muted-foreground mb-4">
                  Browse harvests to see your personalized recommendations, recently viewed items, and saved listings here.
                </p>
                <Button asChild>
                  <Link to="/marketplace">Browse Marketplace</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-green-100 overflow-x-hidden ${bottomNavClass}`}>
      <div className="container mx-auto max-w-screen-md px-4 sm:px-5 py-2 sm:py-4 space-y-4 sm:space-y-6 pb-mobile-content">

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">Unable to load harvests</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => loadDashboardData()}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role-based Content */}
        {getRoleBasedContent()}

        {/* Recent Activity removed on homepage */}
      </div>
    </div>
  );
};

export default Dashboard;
