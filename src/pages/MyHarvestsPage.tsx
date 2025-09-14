import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBottomNav } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Star, 
  Package,
  DollarSign,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Harvest } from '@/types/markit';

const MyHarvestsPage = () => {
  const { user } = useAuth();
  const { bottomNavClass } = useBottomNav();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [filteredHarvests, setFilteredHarvests] = useState<Harvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadHarvests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [harvests, searchQuery, statusFilter]);

  const loadHarvests = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Firebase query
      const mockHarvests: Harvest[] = [
        {
          id: '1',
          farmerId: user?.id || '',
          farmerName: user?.name || '',
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
          farmerId: user?.id || '',
          farmerName: user?.name || '',
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
          location: {
            address: 'Barangay San Jose, Nueva Ecija',
            coordinates: { lat: 15.5, lng: 121.0 }
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
        {
          id: '3',
          farmerId: user?.id || '',
          farmerName: user?.name || '',
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
          status: 'expired',
          basePrice: 120,
          location: {
            address: 'Barangay San Jose, Nueva Ecija',
            coordinates: { lat: 15.5, lng: 121.0 }
          },
          deliveryOptions: {
            pickup: true,
            delivery: false
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

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(harvest => harvest.status === statusFilter);
    }

    setFilteredHarvests(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getQualityColor = (grade: string) => {
    switch (grade) {
      case 'Premium': return 'bg-purple-100 text-purple-800';
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: harvests.length,
      available: harvests.filter(h => h.status === 'available').length,
      sold: harvests.filter(h => h.status === 'sold').length,
      expired: harvests.filter(h => h.status === 'expired').length
    };
    return stats;
  };

  const stats = getStatusStats();

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
    <div className={`min-h-screen ${bottomNavClass}`}>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-mobile-content">
        <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Harvests</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage your posted harvests and track their performance
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/create-harvest">
              <Plus className="h-4 w-4 mr-2" />
              Post New Harvest
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Harvests</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sold</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search your harvests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 sm:h-11"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 sm:h-11 w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Harvests List */}
      <div className="space-y-4">
        {filteredHarvests.map((harvest) => (
          <Card key={harvest.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-1">
                        <h3 className="text-base sm:text-lg font-semibold">{harvest.title}</h3>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Badge className={`${getStatusColor(harvest.status)} text-xs`}>
                            {harvest.status}
                          </Badge>
                          <Badge className={`${getQualityColor(harvest.quality.grade)} text-xs`}>
                            {harvest.quality.grade}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">
                        {harvest.subcategory} • {harvest.quantity.amount} {harvest.quantity.unit}
                      </p>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {harvest.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{harvest.location.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Available</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">₱{harvest.basePrice}/{harvest.quantity.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">
                  <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Link to={`/harvest/${harvest.id}`}>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                  </Button>
                  {harvest.status === 'available' && (
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="p-1 sm:p-2">
                    <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHarvests.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No harvests found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria.'
              : 'Start by posting your first harvest.'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button asChild>
              <Link to="/create-harvest">
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Harvest
              </Link>
            </Button>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default MyHarvestsPage;




