import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PriceGuarantee, MarketData } from '@/types/markit';

const PriceGuaranteePage = () => {
  const [priceGuarantees, setPriceGuarantees] = useState<PriceGuarantee[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPriceGuarantees();
  }, []);

  const loadPriceGuarantees = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Firebase queries
      const mockGuarantees: PriceGuarantee[] = [
        {
          id: '1',
          category: 'agricultural',
          subcategory: 'Rice',
          region: 'Central Luzon',
          minimumPrice: 35,
          currentMarketPrice: 38,
          priceHistory: [
            { date: '2024-01-01', price: 32 },
            { date: '2024-01-15', price: 34 },
            { date: '2024-02-01', price: 36 },
            { date: '2024-02-15', price: 38 }
          ],
          isActive: true,
          validFrom: '2024-01-01',
          validUntil: '2024-12-31',
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          category: 'fisheries',
          subcategory: 'Tilapia',
          region: 'Calabarzon',
          minimumPrice: 120,
          currentMarketPrice: 135,
          priceHistory: [
            { date: '2024-01-01', price: 110 },
            { date: '2024-01-15', price: 115 },
            { date: '2024-02-01', price: 125 },
            { date: '2024-02-15', price: 135 }
          ],
          isActive: true,
          validFrom: '2024-01-01',
          validUntil: '2024-12-31',
          createdAt: '2024-01-01'
        },
        {
          id: '3',
          category: 'agricultural',
          subcategory: 'Tomatoes',
          region: 'Nueva Ecija',
          minimumPrice: 45,
          currentMarketPrice: 52,
          priceHistory: [
            { date: '2024-01-01', price: 40 },
            { date: '2024-01-15', price: 42 },
            { date: '2024-02-01', price: 48 },
            { date: '2024-02-15', price: 52 }
          ],
          isActive: true,
          validFrom: '2024-01-01',
          validUntil: '2024-12-31',
          createdAt: '2024-01-01'
        }
      ];

      const mockMarketData: MarketData[] = [
        {
          category: 'agricultural',
          subcategory: 'Rice',
          region: 'Central Luzon',
          averagePrice: 36.5,
          priceRange: { min: 32, max: 42 },
          totalVolume: 1500,
          totalTransactions: 45,
          priceTrend: 'increasing',
          lastUpdated: '2024-02-15'
        },
        {
          category: 'fisheries',
          subcategory: 'Tilapia',
          region: 'Calabarzon',
          averagePrice: 125,
          priceRange: { min: 110, max: 140 },
          totalVolume: 800,
          totalTransactions: 32,
          priceTrend: 'increasing',
          lastUpdated: '2024-02-15'
        }
      ];

      setPriceGuarantees(mockGuarantees);
      setMarketData(mockMarketData);
    } catch (error) {
      console.error('Error loading price guarantees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'agricultural': return '🌾';
      case 'fisheries': return '🐟';
      case 'livestock': return '🐄';
      case 'dairy': return '🥛';
      case 'poultry': return '🐔';
      default: return '📦';
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
        <h1 className="text-3xl font-bold">Price Guarantee System</h1>
        <p className="text-muted-foreground">
          Protected minimum prices for your harvests based on market data and regional standards
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Price Protection</h3>
                <p className="text-green-700 text-sm">
                  Your harvests are protected with guaranteed minimum prices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Market Monitoring</h3>
                <p className="text-blue-700 text-sm">
                  Real-time price tracking and market analysis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-purple-800">Fair Pricing</h3>
                <p className="text-purple-700 text-sm">
                  Transparent pricing based on production costs and market value
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Guarantees */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Current Price Guarantees</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {priceGuarantees.map((guarantee) => (
            <Card key={guarantee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(guarantee.category)}</span>
                    <div>
                      <CardTitle className="text-lg">{guarantee.subcategory}</CardTitle>
                      <CardDescription className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{guarantee.region}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={guarantee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {guarantee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Guaranteed Minimum:</span>
                    <span className="text-lg font-semibold text-green-600">
                      ₱{guarantee.minimumPrice}/{guarantee.category === 'fisheries' ? 'kg' : 'kg'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Market:</span>
                    <span className="text-lg font-semibold">
                      ₱{guarantee.currentMarketPrice}/{guarantee.category === 'fisheries' ? 'kg' : 'kg'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price Trend:</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon('increasing')}
                      <span className={getTrendColor('increasing')}>+15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valid Until:</span>
                    <span>{new Date(guarantee.validUntil).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link to={`/price-guarantee/${guarantee.category}/${guarantee.subcategory}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Market Data */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {marketData.map((data) => (
            <Card key={`${data.category}-${data.subcategory}`}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getCategoryIcon(data.category)}</span>
                  <div>
                    <CardTitle className="text-lg">{data.subcategory}</CardTitle>
                    <CardDescription className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{data.region}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Price</p>
                    <p className="text-xl font-semibold">₱{data.averagePrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price Range</p>
                    <p className="text-sm">₱{data.priceRange.min} - ₱{data.priceRange.max}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-lg font-semibold">{data.totalVolume} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-lg font-semibold">{data.totalTransactions}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trend:</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(data.priceTrend)}
                      <span className={`text-sm ${getTrendColor(data.priceTrend)}`}>
                        {data.priceTrend}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Last Updated:</span>
                    <span>{new Date(data.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>How Price Guarantee Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="font-semibold mb-2">Market Analysis</h3>
              <p className="text-sm text-muted-foreground">
                We analyze market prices, production costs, and regional standards to determine fair minimum prices.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="font-semibold mb-2">Price Protection</h3>
              <p className="text-sm text-muted-foreground">
                Your harvests are automatically protected with guaranteed minimum prices that update in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="font-semibold mb-2">Fair Compensation</h3>
              <p className="text-sm text-muted-foreground">
                You receive fair compensation for your harvests, eliminating middleman exploitation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceGuaranteePage;




