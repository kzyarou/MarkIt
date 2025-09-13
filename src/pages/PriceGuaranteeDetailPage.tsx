import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  MapPin,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceGuarantee } from '@/types/markit';

const PriceGuaranteeDetailPage = () => {
  const { category, subcategory } = useParams();
  const navigate = useNavigate();
  const [priceGuarantee, setPriceGuarantee] = useState<PriceGuarantee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (category && subcategory) {
      loadPriceGuaranteeDetails();
    }
  }, [category, subcategory]);

  const loadPriceGuaranteeDetails = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Firebase query
      const mockGuarantee: PriceGuarantee = {
        id: '1',
        category: category as any,
        subcategory: subcategory || '',
        region: 'Central Luzon',
        minimumPrice: 35,
        currentMarketPrice: 38,
        priceHistory: [
          { date: '2024-01-01', price: 32 },
          { date: '2024-01-15', price: 34 },
          { date: '2024-02-01', price: 36 },
          { date: '2024-02-15', price: 38 },
          { date: '2024-03-01', price: 40 },
          { date: '2024-03-15', price: 42 }
        ],
        isActive: true,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        createdAt: '2024-01-01'
      };

      setPriceGuarantee(mockGuarantee);
    } catch (error) {
      console.error('Error loading price guarantee details:', error);
    } finally {
      setIsLoading(false);
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

  const calculatePriceChange = () => {
    if (!priceGuarantee || priceGuarantee.priceHistory.length < 2) return 0;
    
    const firstPrice = priceGuarantee.priceHistory[0].price;
    const lastPrice = priceGuarantee.priceHistory[priceGuarantee.priceHistory.length - 1].price;
    
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  const formatChartData = () => {
    if (!priceGuarantee) return [];
    
    return priceGuarantee.priceHistory.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: item.price,
      minimumPrice: priceGuarantee.minimumPrice
    }));
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

  if (!priceGuarantee) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Price guarantee not found</h3>
          <p className="text-muted-foreground mb-4">
            The price guarantee you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/price-guarantee')}>
            Back to Price Guarantees
          </Button>
        </div>
      </div>
    );
  }

  const priceChange = calculatePriceChange();
  const chartData = formatChartData();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/price-guarantee')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Price Guarantees
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-4xl">{getCategoryIcon(priceGuarantee.category)}</span>
              <div>
                <h1 className="text-3xl font-bold">{priceGuarantee.subcategory}</h1>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{priceGuarantee.region}</span>
                  <Badge className={priceGuarantee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {priceGuarantee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Price History</span>
              </CardTitle>
              <CardDescription>
                Price trends over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `₱${value}`,
                        name === 'price' ? 'Market Price' : 'Minimum Price'
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Market Price"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="minimumPrice" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Minimum Price"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Price Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Price Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of current pricing and trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Guaranteed Minimum</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₱{priceGuarantee.minimumPrice}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Market</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₱{priceGuarantee.currentMarketPrice}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Price Change</p>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(priceChange >= 0 ? 'increasing' : 'decreasing')}
                        <p className={`text-2xl font-bold ${getTrendColor(priceChange >= 0 ? 'increasing' : 'decreasing')}`}>
                          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Above Minimum</p>
                      <p className="text-2xl font-bold text-orange-600">
                        +₱{priceGuarantee.currentMarketPrice - priceGuarantee.minimumPrice}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>
                Monthly price changes and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Change</th>
                      <th className="text-right py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceGuarantee.priceHistory.map((item, index) => {
                      const prevPrice = index > 0 ? priceGuarantee.priceHistory[index - 1].price : item.price;
                      const change = item.price - prevPrice;
                      const changePercent = (change / prevPrice) * 100;
                      
                      return (
                        <tr key={item.date} className="border-b">
                          <td className="py-2">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="text-right py-2 font-medium">₱{item.price}</td>
                          <td className={`text-right py-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '+' : ''}₱{change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                          </td>
                          <td className="text-right py-2">
                            <Badge className={item.price >= priceGuarantee.minimumPrice ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {item.price >= priceGuarantee.minimumPrice ? 'Above Min' : 'Below Min'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={priceGuarantee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {priceGuarantee.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valid From:</span>
                <span>{new Date(priceGuarantee.validFrom).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valid Until:</span>
                <span>{new Date(priceGuarantee.validUntil).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Days Remaining:</span>
                <span className="font-medium">
                  {Math.ceil((new Date(priceGuarantee.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Price Protection Info */}
          <Card>
            <CardHeader>
              <CardTitle>Price Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Minimum Price Guaranteed</p>
                  <p className="text-xs text-muted-foreground">
                    Your harvests are protected with a minimum price of ₱{priceGuarantee.minimumPrice}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Market-Based Pricing</p>
                  <p className="text-xs text-muted-foreground">
                    Prices are calculated based on real market data and regional standards
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Automatic Updates</p>
                  <p className="text-xs text-muted-foreground">
                    Price guarantees are updated automatically based on market conditions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Price Trend</span>
                </div>
                <p className="text-xs text-blue-700">
                  {priceChange >= 0 ? 'Prices are increasing' : 'Prices are decreasing'} by {Math.abs(priceChange).toFixed(1)}% over the period
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Protection Level</span>
                </div>
                <p className="text-xs text-green-700">
                  Current market price is ₱{priceGuarantee.currentMarketPrice - priceGuarantee.minimumPrice} above the guaranteed minimum
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Set Price Alert
            </Button>
            <Button variant="outline" className="w-full">
              View Similar Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceGuaranteeDetailPage;




