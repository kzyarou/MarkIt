import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Package, MapPin, Clock, Star, DollarSign, Truck, User, Calendar, TrendingUp, BarChart3, Smartphone } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import MarkItHeader from '@/components/MarkItHeader';
import { useBottomNav } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { Harvest, ProductCategory, SearchFilters } from '@/types/markit';

export default function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const { bottomNavClass } = useBottomNav();
  const [searchResults, setSearchResults] = useState<Harvest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showPriceAnalytics, setShowPriceAnalytics] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: undefined,
    subcategory: undefined,
    priceRange: undefined,
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [priceAnalytics, setPriceAnalytics] = useState<{
    lowest: number;
    highest: number;
    average: number;
    totalProducts: number;
  } | null>(null);

  const { theme } = useTheme();
  const isDark = theme === 'dark';


  // Mock data generation - same as Dashboard
  const mockTitles = ['Fresh Organic', 'High-Quality', 'Locally Grown', 'Newly Harvested', 'Premium Grade'];
  const mockSubs = ['Rice', 'Corn', 'Coconut', 'Banana', 'Vegetables', 'Fish'];
  const mockBarangays = ['Barangay 1 (Poblacion)', 'Barangay 2 (Poblacion)', 'Aroganga', 'Buenavista', 'Rizal', 'San Vicente'];
  const mockUnits = ['kg', 'bags', 'crates'];

  const generateMockHarvests = (count: number): Harvest[] => {
    const items: Harvest[] = [];
    
    // Predefined mock data for consistency
    const predefinedData = [
      { sub: 'Rice', titlePrefix: 'Fresh Organic', unit: 'kg', barangay: 'Barangay 1 (Poblacion)', amount: 150, price: 25 },
      { sub: 'Rice', titlePrefix: 'High-Quality', unit: 'bags', barangay: 'Barangay 2 (Poblacion)', amount: 200, price: 30 },
      { sub: 'Rice', titlePrefix: 'Locally Grown', unit: 'kg', barangay: 'Aroganga', amount: 180, price: 28 },
      { sub: 'Rice', titlePrefix: 'Newly Harvested', unit: 'bags', barangay: 'Buenavista', amount: 220, price: 32 },
      { sub: 'Rice', titlePrefix: 'Premium Grade', unit: 'kg', barangay: 'Rizal', amount: 160, price: 35 },
      { sub: 'Rice', titlePrefix: 'Fresh Organic', unit: 'bags', barangay: 'San Vicente', amount: 190, price: 27 },
      { sub: 'Rice', titlePrefix: 'High-Quality', unit: 'kg', barangay: 'Barangay 1 (Poblacion)', amount: 210, price: 29 },
      { sub: 'Rice', titlePrefix: 'Locally Grown', unit: 'bags', barangay: 'Barangay 2 (Poblacion)', amount: 170, price: 26 },
      { sub: 'Corn', titlePrefix: 'Fresh Organic', unit: 'kg', barangay: 'Aroganga', amount: 140, price: 22 },
      { sub: 'Corn', titlePrefix: 'High-Quality', unit: 'bags', barangay: 'Buenavista', amount: 180, price: 24 },
      { sub: 'Coconut', titlePrefix: 'Locally Grown', unit: 'kg', barangay: 'Rizal', amount: 120, price: 20 },
      { sub: 'Coconut', titlePrefix: 'Newly Harvested', unit: 'bags', barangay: 'San Vicente', amount: 160, price: 23 },
      { sub: 'Banana', titlePrefix: 'Premium Grade', unit: 'kg', barangay: 'Barangay 1 (Poblacion)', amount: 100, price: 18 },
      { sub: 'Banana', titlePrefix: 'Fresh Organic', unit: 'bags', barangay: 'Barangay 2 (Poblacion)', amount: 130, price: 21 },
      { sub: 'Vegetables', titlePrefix: 'High-Quality', unit: 'kg', barangay: 'Aroganga', amount: 90, price: 15 },
      { sub: 'Vegetables', titlePrefix: 'Locally Grown', unit: 'bags', barangay: 'Buenavista', amount: 110, price: 17 },
      { sub: 'Fish', titlePrefix: 'Newly Harvested', unit: 'kg', barangay: 'Rizal', amount: 80, price: 40 },
      { sub: 'Fish', titlePrefix: 'Premium Grade', unit: 'bags', barangay: 'San Vicente', amount: 95, price: 45 },
      { sub: 'Rice', titlePrefix: 'Fresh Organic', unit: 'kg', barangay: 'Barangay 1 (Poblacion)', amount: 175, price: 31 },
      { sub: 'Rice', titlePrefix: 'High-Quality', unit: 'bags', barangay: 'Barangay 2 (Poblacion)', amount: 195, price: 33 },
      { sub: 'Corn', titlePrefix: 'Locally Grown', unit: 'kg', barangay: 'Aroganga', amount: 155, price: 25 },
      { sub: 'Corn', titlePrefix: 'Newly Harvested', unit: 'bags', barangay: 'Buenavista', amount: 185, price: 27 },
      { sub: 'Coconut', titlePrefix: 'Premium Grade', unit: 'kg', barangay: 'Rizal', amount: 135, price: 22 },
      { sub: 'Coconut', titlePrefix: 'Fresh Organic', unit: 'bags', barangay: 'San Vicente', amount: 165, price: 24 }
    ];
    
    for (let i = 0; i < count && i < predefinedData.length; i++) {
      const data = predefinedData[i];
      const farmerNames = ['Juan Dela Cruz', 'Maria Santos', 'Pedro Ramos', 'Ana Reyes'];
      const grades = ['A', 'B', 'Premium'];
      
      items.push({
        id: `mock-${i + 1}`,
        farmerId: `farmer-mock-${i + 1}`,
        farmerName: farmerNames[i % 4],
        title: `${data.titlePrefix} ${data.sub}`,
        description: `Sample ${data.sub.toLowerCase()} from Dolores, Eastern Samar. Mock listing for demo on homepage.`,
        category: (['agricultural', 'fisheries'] as any)[data.sub === 'Fish' ? 1 : 0],
        subcategory: data.sub,
        quantity: { amount: data.amount, unit: data.unit },
        quality: { grade: grades[i % 3], freshness: 'fresh', organic: i % 2 === 0, certifications: [] },
        images: [],
        harvestDate: new Date(Date.now() - (i % 5) * 86400000).toISOString(),
        status: 'available',
        basePrice: data.price,
        location: { address: `${data.barangay}, Dolores, Eastern Samar`, coordinates: { lat: 0, lng: 0 } },
        deliveryOptions: { pickup: true, delivery: i % 3 === 0 }
      } as Harvest);
    }
    return items;
  };

  const loadSearchData = async (customFilters?: SearchFilters) => {
    setIsSearching(true);
    setHasSearched(true);

    // Use custom filters if provided, otherwise use current filters
    const currentFilters = customFilters || filters;

    try {
      // Fetch harvests from Firestore (same as Dashboard)
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

      // Combine fetched with mock data to enrich search (same as Dashboard)
      const extra = generateMockHarvests(24);
      const allHarvests = [...harvestsData, ...extra];
      
      // Debug logging
      console.log('Firebase data count:', harvestsData.length);
      console.log('Mock data count:', extra.length);
      console.log('Total harvests:', allHarvests.length);

      // Filter the combined data
    const queryLower = searchQuery.toLowerCase();
      
      let results: Harvest[] = allHarvests.filter(harvest => {
        const matchesSearch = queryLower === '' || 
          harvest.title.toLowerCase().includes(queryLower) ||
          harvest.description.toLowerCase().includes(queryLower) ||
          harvest.subcategory.toLowerCase().includes(queryLower) ||
          harvest.farmerName.toLowerCase().includes(queryLower);
        
        const matchesPriceRange = !currentFilters.priceRange || 
          (harvest.basePrice >= currentFilters.priceRange.min && harvest.basePrice <= currentFilters.priceRange.max);

        return matchesSearch && matchesPriceRange;
      });
      
      // Debug logging for search results
      console.log('Search query:', searchQuery);
      console.log('Filtered results count:', results.length);
      console.log('Rice results:', results.filter(h => h.subcategory.toLowerCase().includes('rice')).length);

      // Sort results
      if (currentFilters.sortBy === 'price') {
        results.sort((a, b) => {
          return currentFilters.sortOrder === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice;
        });
      } else if (currentFilters.sortBy === 'date') {
        results.sort((a, b) => {
          return currentFilters.sortOrder === 'asc' 
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }

    setSearchResults(results);
      calculatePriceAnalytics(results);
    } catch (error) {
      console.error('Error loading search data:', error);
      // Fallback to mock data only
      const extra = generateMockHarvests(24);
      
      // Filter mock data with search query
      const queryLower = searchQuery.toLowerCase();
      const filteredResults = extra.filter(harvest => {
        const matchesSearch = queryLower === '' || 
          harvest.title.toLowerCase().includes(queryLower) ||
          harvest.description.toLowerCase().includes(queryLower) ||
          harvest.subcategory.toLowerCase().includes(queryLower) ||
          harvest.farmerName.toLowerCase().includes(queryLower);
        
        const matchesPriceRange = !currentFilters.priceRange || 
          (harvest.basePrice >= currentFilters.priceRange.min && harvest.basePrice <= currentFilters.priceRange.max);

        return matchesSearch && matchesPriceRange;
      });
      
      console.log('Fallback - Mock data count:', extra.length);
      console.log('Fallback - Filtered results count:', filteredResults.length);
      console.log('Fallback - Rice results:', filteredResults.filter(h => h.subcategory.toLowerCase().includes('rice')).length);
      
      setSearchResults(filteredResults);
      calculatePriceAnalytics(filteredResults);
    }

    setIsSearching(false);
  };

  const handleSearch = () => {
    loadSearchData();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


  const handlePriceSort = (sortOrder: 'asc' | 'desc') => {
    const newFilters = { 
      ...filters, 
      sortBy: 'price' as const, 
      sortOrder: sortOrder 
    };
    setFilters(newFilters);
    
    // Sort existing results without re-fetching to maintain accuracy
    const sortedResults = [...searchResults].sort((a, b) => {
      return sortOrder === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice;
    });
    
    setSearchResults(sortedResults);
    // Recalculate price analytics with sorted results
    calculatePriceAnalytics(sortedResults);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const calculatePriceAnalytics = (harvests: Harvest[]) => {
    if (harvests.length === 0) {
      setPriceAnalytics(null);
      return;
    }

    const prices = harvests.map(h => h.basePrice);
    const lowest = Math.min(...prices);
    const highest = Math.max(...prices);
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    setPriceAnalytics({
      lowest,
      highest,
      average: Math.round(average * 100) / 100,
      totalProducts: harvests.length
    });
  };

  // No initial data loading - wait for user to search

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0F1A2B] text-white' : 'bg-background'} ${bottomNavClass}`}>
      <MarkItHeader subtitle={t('search') || 'Search'} />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 pb-mobile-content">
        {/* Search Form - Mobile Optimized */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search className="w-5 h-5" />
              {t('search_products') || 'Search Products'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input - Mobile First */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('search_products_placeholder') || 'Search by product name, description, or farmer...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 text-base sm:text-sm h-11"
                />
              </div>
              <div className="flex gap-2">
                {hasSearched && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPriceAnalytics(!showPriceAnalytics)}
                    className={`flex items-center gap-2 flex-1 sm:flex-none h-11 ${
                      showPriceAnalytics ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    disabled={searchResults.length === 0}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('realtime_price') || 'Real-Time Price'}</span>
                    <span className="sm:hidden">{t('prices') || 'Prices'}</span>
                  </Button>
                )}
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex items-center gap-2 flex-1 sm:flex-none h-11"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{t('search') || 'Search'}</span>
                </Button>
              </div>
            </div>

            {/* Show All Button - Mobile Optimized - Only show after search */}
            {hasSearched && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    category: undefined,
                    subcategory: undefined,
                    priceRange: undefined,
                    sortBy: 'date',
                    sortOrder: 'desc'
                  });
                  setTimeout(() => loadSearchData(), 0);
                }}
                className="w-full sm:w-auto"
              >
                {t('show_all') || 'Show All Products'}
              </Button>
            )}

            {/* Real-Time Price Analytics - Only show when there are search results */}
            {showPriceAnalytics && searchResults.length > 0 && (
              <div className="space-y-4">
                {priceAnalytics ? (
                  <div className="space-y-4">
                    {/* Price Summary Header */}
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{t('market_insights') || 'Market Insights'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('price_analytics_desc') || 'Real-time pricing data for'} {priceAnalytics.totalProducts} {t('products') || 'products'}
                      </p>
                    </div>

                    {/* Price Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {/* Lowest Price - Clickable */}
                      <Card 
                        className="p-4 border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/10 cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-950/20 transition-colors"
                        onClick={() => handlePriceSort('asc')}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-muted-foreground">{t('lowest_price') || 'Lowest Price'}</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          {formatPrice(priceAnalytics.lowest)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t('best_deal') || 'Best deal available'}</p>
                        <p className="text-xs text-green-600 mt-1 font-medium">{t('click_to_sort_low') || 'Click to sort: Low to High'}</p>
                      </Card>

                      {/* Highest Price - Clickable */}
                      <Card 
                        className="p-4 border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/10 cursor-pointer hover:bg-red-100/50 dark:hover:bg-red-950/20 transition-colors"
                        onClick={() => handlePriceSort('desc')}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                          <span className="text-sm font-medium text-muted-foreground">{t('highest_price') || 'Highest Price'}</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-red-600">
                          {formatPrice(priceAnalytics.highest)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t('premium_quality') || 'Premium quality'}</p>
                        <p className="text-xs text-red-600 mt-1 font-medium">{t('click_to_sort_high') || 'Click to sort: High to Low'}</p>
                      </Card>

                      {/* Average Price */}
                      <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/10">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-muted-foreground">{t('average_price') || 'Average Price'}</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {formatPrice(priceAnalytics.average)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t('market_average') || 'Market average'}</p>
                      </Card>

                    </div>
                  </div>
                ) : (
                  <Card className="p-6 text-center border-dashed">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('no_price_data') || 'No Price Data'}</h3>
                    <p className="text-muted-foreground">{t('no_price_data_desc') || 'Search for products to see real-time pricing analytics'}</p>
                  </Card>
                )}

              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results - Mobile Optimized */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                {(t('search_results') || 'Search Results')} ({searchResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {searchResults.map((harvest) => (
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
                          <span className="truncate">Harvested: {formatDate(harvest.harvestDate)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                            <span className="font-semibold text-base sm:text-lg text-green-600">
                              {formatPrice(harvest.basePrice)}
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
                        
                        <Button 
                          className="w-full mt-2 sm:mt-3 text-sm" 
                          onClick={() => navigate(`/harvest/${harvest.id}`)}
                        >
                          {t('view_details') || 'View Details'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Initial state - no search performed yet */}
        {!hasSearched && (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">{t('search_products') || 'Search Products'}</h3>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                {t('search_products_placeholder') || 'Search by product name, description, or farmer...'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* No results after search */}
        {hasSearched && searchResults.length === 0 && !isSearching && (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">{t('no_products_found') || 'No products found'}</h3>
              <p className="text-sm sm:text-base text-muted-foreground px-4">{t('try_different_search') || 'Try searching with different keywords or adjust your filters.'}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
