import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  Package,
  DollarSign,
  Truck,
  User,
  Calendar,
  MessageCircle,
  Heart,
  Share2
} from 'lucide-react';
import { Harvest, Bid } from '@/types/markit';

const HarvestDetailsPage = () => {
  const { harvestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [harvest, setHarvest] = useState<Harvest | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBidding, setIsBidding] = useState(false);

  useEffect(() => {
    if (harvestId) {
      loadHarvestDetails();
    }
  }, [harvestId]);

  const loadHarvestDetails = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Firebase query
      const mockHarvest: Harvest = {
        id: harvestId || '',
        farmerId: 'farmer1',
        farmerName: 'Juan Dela Cruz',
        title: 'Fresh Organic Tomatoes',
        description: 'Freshly harvested organic tomatoes from our farm. Grown without pesticides and chemical fertilizers. These tomatoes are perfect for salads, cooking, and canning. We use sustainable farming practices and our tomatoes are certified organic.',
        category: 'agricultural',
        subcategory: 'Vegetables',
        quantity: { amount: 50, unit: 'kg' },
        quality: {
          grade: 'A',
          freshness: 'fresh',
          organic: true,
          certifications: ['Organic', 'Non-GMO', 'Fair Trade']
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
      };

      const mockBids: Bid[] = [
        {
          id: '1',
          harvestId: harvestId || '',
          buyerId: 'buyer1',
          buyerName: 'Green Restaurant',
          amount: 52,
          totalAmount: 2600,
          quantity: 50,
          message: 'We need fresh tomatoes for our daily operations. Can deliver today?',
          status: 'active',
          isAutoBid: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          harvestId: harvestId || '',
          buyerId: 'buyer2',
          buyerName: 'City School District',
          amount: 48,
          totalAmount: 2400,
          quantity: 50,
          message: 'For our school feeding program. Prefer organic produce.',
          status: 'active',
          isAutoBid: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setHarvest(mockHarvest);
      setBids(mockBids);
    } catch (error) {
      console.error('Error loading harvest details:', error);
    } finally {
      setIsLoading(false);
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

  const handleBidClick = () => {
    if (user?.role === 'buyer') {
      navigate(`/bidding/${harvestId}`);
    } else {
      setIsBidding(true);
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

  if (!harvest) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Harvest not found</h3>
          <p className="text-muted-foreground mb-4">
            The harvest you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold">{harvest.title}</h1>
              <Badge className={getQualityColor(harvest.quality.grade)}>
                {harvest.quality.grade}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{harvest.farmerName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{harvest.location.address}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{getTimeRemaining(harvest.biddingEndDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {harvest.description}
              </p>
            </CardContent>
          </Card>

          {/* Quality & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Quality & Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Grade</label>
                  <p className="text-lg font-semibold">{harvest.quality.grade}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Freshness</label>
                  <p className="text-lg font-semibold capitalize">{harvest.quality.freshness}</p>
                </div>
              </div>
              
              {harvest.quality.organic && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Organic
                  </Badge>
                </div>
              )}
              
              {harvest.quality.certifications.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Certifications</label>
                  <div className="flex flex-wrap gap-2">
                    {harvest.quality.certifications.map((cert) => (
                      <Badge key={cert} variant="outline">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bidding History */}
          {bids.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bidding History</CardTitle>
                <CardDescription>
                  {bids.length} bid{bids.length !== 1 ? 's' : ''} received
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{bid.buyerName}</span>
                          <Badge variant="outline" className="text-xs">
                            {bid.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{bid.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">₱{bid.amount}/{harvest.quantity.unit}</p>
                        <p className="text-sm text-muted-foreground">
                          {bid.quantity} {harvest.quantity.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base Price:</span>
                <span className="text-lg font-semibold">₱{harvest.basePrice}/{harvest.quantity.unit}</span>
              </div>
              {harvest.currentHighestBid && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Highest Bid:</span>
                  <span className="text-lg font-semibold text-green-600">
                    ₱{harvest.currentHighestBid}/{harvest.quantity.unit}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="text-lg font-semibold">
                  {harvest.quantity.amount} {harvest.quantity.unit}
                </span>
              </div>
              {harvest.currentHighestBid && (
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₱{(harvest.currentHighestBid * harvest.quantity.amount).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {harvest.deliveryOptions.pickup && (
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Pickup Available</span>
                </div>
              )}
              {harvest.deliveryOptions.delivery && (
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>Delivery Available</span>
                  {harvest.deliveryOptions.deliveryRadius && (
                    <span className="text-sm text-muted-foreground">
                      ({harvest.deliveryOptions.deliveryRadius}km radius)
                    </span>
                  )}
                </div>
              )}
              {harvest.deliveryOptions.deliveryFee && (
                <div className="text-sm text-muted-foreground">
                  Delivery Fee: ₱{harvest.deliveryOptions.deliveryFee}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            {user?.role === 'buyer' ? (
              <Button 
                onClick={handleBidClick}
                className="w-full"
                size="lg"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Place Bid
              </Button>
            ) : user?.role === 'farmer' || user?.role === 'fisherman' ? (
              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Manage Bids
                </Button>
                <Button variant="outline" className="w-full">
                  Edit Harvest
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full"
                size="lg"
              >
                Sign In to Bid
              </Button>
            )}
          </div>

          {/* Harvest Info */}
          <Card>
            <CardHeader>
              <CardTitle>Harvest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Harvest Date:</span>
                <span>{new Date(harvest.harvestDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="capitalize">{harvest.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subcategory:</span>
                <span>{harvest.subcategory}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bidding Ends:</span>
                <span>{new Date(harvest.biddingEndDate).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HarvestDetailsPage;




