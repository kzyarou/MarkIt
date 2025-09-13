import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  DollarSign, 
  Clock, 
  Package,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';
import { Harvest, Bid } from '@/types/markit';

const BiddingPage = () => {
  const { harvestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [harvest, setHarvest] = useState<Harvest | null>(null);
  const [existingBids, setExistingBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidQuantity, setBidQuantity] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [isAutoBid, setIsAutoBid] = useState(false);
  const [maxBidAmount, setMaxBidAmount] = useState('');

  useEffect(() => {
    if (harvestId) {
      loadHarvestAndBids();
    }
  }, [harvestId]);

  const loadHarvestAndBids = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Firebase queries
      const mockHarvest: Harvest = {
        id: harvestId || '',
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
      setExistingBids(mockBids);
      
      // Set default quantity to full amount
      setBidQuantity(mockHarvest.quantity.amount.toString());
    } catch (error) {
      console.error('Error loading harvest and bids:', error);
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

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!harvest || !user) return;
    
    const amount = parseFloat(bidAmount);
    const quantity = parseFloat(bidQuantity);
    
    if (amount <= harvest.basePrice) {
      alert('Bid amount must be higher than the base price');
      return;
    }
    
    if (quantity > harvest.quantity.amount) {
      alert('Bid quantity cannot exceed available quantity');
      return;
    }
    
    if (harvest.currentHighestBid && amount <= harvest.currentHighestBid) {
      alert('Bid amount must be higher than the current highest bid');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual Firebase submission
      const newBid: Omit<Bid, 'id' | 'createdAt' | 'updatedAt'> = {
        harvestId: harvest.id,
        buyerId: user.id,
        buyerName: user.name,
        amount: amount,
        totalAmount: amount * quantity,
        quantity: quantity,
        message: bidMessage,
        status: 'active',
        isAutoBid: isAutoBid,
        maxBidAmount: isAutoBid ? parseFloat(maxBidAmount) : undefined
      };

      console.log('Submitting bid:', newBid);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/my-bids');
    } catch (error) {
      console.error('Error submitting bid:', error);
    } finally {
      setIsSubmitting(false);
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

  const totalValue = parseFloat(bidAmount) * parseFloat(bidQuantity) || 0;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
              <h1 className="text-3xl font-bold">Place Your Bid</h1>
              <Badge className={getQualityColor(harvest.quality.grade)}>
                {harvest.quality.grade}
              </Badge>
            </div>
            <h2 className="text-xl text-muted-foreground">{harvest.title}</h2>
            <div className="flex items-center space-x-4 text-muted-foreground mt-2">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bidding Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Place Your Bid</CardTitle>
              <CardDescription>
                Enter your bid amount and quantity for this harvest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitBid} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bidAmount">Bid Amount (₱ per {harvest.quantity.unit}) *</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Base price: ₱{harvest.basePrice}/{harvest.quantity.unit}
                      {harvest.currentHighestBid && (
                        <span className="ml-2 text-green-600">
                          • Current highest: ₱{harvest.currentHighestBid}/{harvest.quantity.unit}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bidQuantity">Quantity ({harvest.quantity.unit}) *</Label>
                    <Input
                      id="bidQuantity"
                      type="number"
                      placeholder="0"
                      value={bidQuantity}
                      onChange={(e) => setBidQuantity(e.target.value)}
                      max={harvest.quantity.amount}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Available: {harvest.quantity.amount} {harvest.quantity.unit}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bidMessage">Message to Farmer (Optional)</Label>
                  <Textarea
                    id="bidMessage"
                    placeholder="Add a message to the farmer..."
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoBid"
                      checked={isAutoBid}
                      onChange={(e) => setIsAutoBid(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="autoBid">Enable Auto-Bidding</Label>
                  </div>
                  
                  {isAutoBid && (
                    <div className="space-y-2">
                      <Label htmlFor="maxBidAmount">Maximum Bid Amount (₱ per {harvest.quantity.unit})</Label>
                      <Input
                        id="maxBidAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={maxBidAmount}
                        onChange={(e) => setMaxBidAmount(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Auto-bidding will automatically increase your bid up to this amount
                      </p>
                    </div>
                  )}
                </div>

                {/* Total Value Display */}
                {bidAmount && bidQuantity && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Bid Value:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₱{totalValue.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bidQuantity} {harvest.quantity.unit} × ₱{bidAmount} = ₱{totalValue.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !bidAmount || !bidQuantity}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Harvest Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Harvest Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Base Price:</span>
                  <span className="font-medium">₱{harvest.basePrice}/{harvest.quantity.unit}</span>
                </div>
                {harvest.currentHighestBid && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Highest Bid:</span>
                    <span className="font-medium text-green-600">
                      ₱{harvest.currentHighestBid}/{harvest.quantity.unit}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-medium">
                    {harvest.quantity.amount} {harvest.quantity.unit}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time Left:</span>
                  <span className="font-medium text-orange-600">
                    {getTimeRemaining(harvest.biddingEndDate)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Grade:</span>
                <Badge className={getQualityColor(harvest.quality.grade)}>
                  {harvest.quality.grade}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Freshness:</span>
                <span className="capitalize">{harvest.quality.freshness}</span>
              </div>
              {harvest.quality.organic && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Organic Certified</span>
                </div>
              )}
              {harvest.quality.certifications.map((cert) => (
                <div key={cert} className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{cert}</span>
                </div>
              ))}
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
                  <span className="text-sm">Pickup Available</span>
                </div>
              )}
              {harvest.deliveryOptions.delivery && (
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Delivery Available</span>
                  {harvest.deliveryOptions.deliveryRadius && (
                    <span className="text-xs text-muted-foreground">
                      ({harvest.deliveryOptions.deliveryRadius}km)
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

          {/* Bidding Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Bidding Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>Higher bids have better chances of being accepted</span>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>Auto-bidding helps you stay competitive</span>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>You can modify or withdraw your bid anytime</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BiddingPage;




