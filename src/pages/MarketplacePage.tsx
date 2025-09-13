import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Star, 
  Package,
  DollarSign,
  Truck,
  User,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Harvest, SearchFilters, ProductCategory } from '@/types/markit';

const MarketplacePage = () => {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [filteredHarvests, setFilteredHarvests] = useState<Harvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: undefined,
    subcategory: undefined,
    priceRange: undefined,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const categories = {
    agricultural: [
      'Rice', 'Corn', 'Wheat', 'Vegetables', 'Fruits', 'Herbs', 'Grains', 'Legumes'
    ],
    fisheries: [
      'Fish', 'Shrimp', 'Crab', 'Squid', 'Mussels', 'Oysters', 'Seaweed', 'Other Seafood'
    ],
    livestock: [
      'Cattle', 'Pigs', 'Goats', 'Sheep', 'Poultry', 'Dairy Products'
    ],
    dairy: [
      'Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream'
    ],
    poultry: [
      'Chicken', 'Duck', 'Turkey', 'Eggs'
    ]
  };

  useEffect(() => {
    loadHarvests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [harvests, searchQuery, filters]);

  const loadHarvests = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Firebase query
      const mockHarvests: Harvest[] = [
        {
          id: '1',
          farmerId: 'farmer1',
          farmerName: 'Juan Dela Cruz',
          title: 'Fresh Organic Tomatoes',
          description: 'Freshly harvested organic tomatoes from our farm. Grown without pesticides and chemical fertilizers.',
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
          biddingEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
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
        {
          id: '2',
          farmerId: 'farmer2',
          farmerName: 'Maria Santos',
          title: 'Fresh Tilapia Fish',
          description: 'Fresh tilapia from our fishpond. Clean and ready for cooking.',
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
          status: 'available',
          basePrice: 120,
          currentHighestBid: 135,
          biddingEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
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
        {
          id: '3',
          farmerId: 'farmer3',
          farmerName: 'Pedro Garcia',
          title: 'Premium Rice - Jasmine',
          description: 'High-quality jasmine rice from our rice fields. Perfect for daily consumption.',
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
          status: 'available',
          basePrice: 35,
          currentHighestBid: 38,
          biddingEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
        }
      ];

      setHarvests(mockHarvests);
    } catch (error) {
      console.error('Error loading harvests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...harvests];

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(harvest =>
        harvest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        harvest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        harvest.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(harvest => harvest.category === filters.category);
    }

    // Subcategory filter
    if (filters.subcategory) {
      filtered = filtered.filter(harvest => harvest.subcategory === filters.subcategory);
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(harvest =>
        harvest.basePrice >= filters.priceRange!.min &&
        harvest.basePrice <= filters.priceRange!.max
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return filters.sortOrder === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice;
        case 'rating':
          return filters.sortOrder === 'asc' ? (a.currentHighestBid || 0) - (b.currentHighestBid || 0) : (b.currentHighestBid || 0) - (a.currentHighestBid || 0);
        case 'quantity':
          return filters.sortOrder === 'asc' ? a.quantity.amount - b.quantity.amount : b.quantity.amount - a.quantity.amount;
        case 'date':
        default:
          return filters.sortOrder === 'asc' 
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredHarvests(filtered);
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

  const getQualityColor = (grade: string) => {
    switch (grade) {
      case 'Premium': return 'bg-purple-100 text-purple-800';
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover fresh harvests from local farmers and fishermen
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search harvests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={filters.category || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value as ProductCategory || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {Object.entries(categories).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filters.category && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subcategory</label>
                    <Select value={filters.subcategory || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, subcategory: value || undefined }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All subcategories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All subcategories</SelectItem>
                        {categories[filters.category as keyof typeof categories]?.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort by</label>
                  <Select value={filters.sortBy || 'date'} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="rating">Highest Bid</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Order</label>
                  <Select value={filters.sortOrder || 'desc'} onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value as 'asc' | 'desc' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredHarvests.length} harvest{filteredHarvests.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Harvest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHarvests.map((harvest) => (
          <Card key={harvest.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{harvest.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{harvest.farmerName}</span>
                  </CardDescription>
                </div>
                <Badge className={getQualityColor(harvest.quality.grade)}>
                  {harvest.quality.grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
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
                {harvest.currentHighestBid && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Highest Bid:</span>
                    <span className="font-medium text-green-600">₱{harvest.currentHighestBid}/{harvest.quantity.unit}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {harvest.quality.organic && (
                  <Badge variant="outline" className="text-xs">Organic</Badge>
                )}
                {harvest.quality.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{harvest.location.address}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{getTimeRemaining(harvest.biddingEndDate)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  {harvest.deliveryOptions.pickup && (
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4" />
                      <span>Pickup</span>
                    </div>
                  )}
                  {harvest.deliveryOptions.delivery && (
                    <div className="flex items-center space-x-1">
                      <Truck className="h-4 w-4" />
                      <span>Delivery</span>
                    </div>
                  )}
                </div>
                <Button asChild size="sm">
                  <Link to={`/bidding/${harvest.id}`}>
                    Place Bid
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHarvests.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No harvests found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new harvests.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;

