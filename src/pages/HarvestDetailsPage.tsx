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
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Harvest } from '@/types/markit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ConversationService } from '@/services/conversationService';

const HarvestDetailsPage = () => {
  const { harvestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [harvest, setHarvest] = useState<Harvest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  useEffect(() => {
    if (harvestId) {
      loadHarvestDetails();
    }
  }, [harvestId]);

  const loadHarvestDetails = async () => {
    setIsLoading(true);
    try {
      if (!harvestId) {
        throw new Error('No harvest ID provided');
      }

      const harvestDoc = await getDoc(doc(db, 'harvests', harvestId));
      
      if (!harvestDoc.exists()) {
        throw new Error('Harvest not found');
      }

      const harvestData = harvestDoc.data() as Harvest;
      const harvestWithId = { ...harvestData, id: harvestDoc.id };
      setHarvest(harvestWithId);
    } catch (error) {
      console.error('Error loading harvest details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user?.id || !harvest?.farmerId) {
      navigate('/auth');
      return;
    }

    setIsStartingConversation(true);
    try {
      const conversationId = await ConversationService.startConversation(
        user.id,
        harvest.farmerId,
        harvest.id,
        harvest.title
      );
      
      // Navigate to messages page with the conversation selected
      navigate(`/messages?conversation=${conversationId}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      // Fallback to general messages page
      navigate('/messages');
    } finally {
      setIsStartingConversation(false);
    }
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

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageViewer = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (harvest && selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % harvest.images.length);
    }
  };

  const prevImage = () => {
    if (harvest && selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === 0 ? harvest.images.length - 1 : selectedImageIndex - 1);
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
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{harvest.title}</h1>
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
                <span>Available</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Images */}
          {harvest.images && harvest.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>Click on any image to view full size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {harvest.images.map((imageUrl, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group relative"
                      onClick={() => openImageViewer(index)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Harvest image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          console.error('Image failed to load:', imageUrl);
                          // Show fallback content
                          const container = e.currentTarget.parentElement;
                          if (container) {
                            container.innerHTML = `
                              <div class="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-500">
                                <Package class="h-8 w-8 mb-2" />
                                <span class="text-sm">Image failed to load</span>
                              </div>
                            `;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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

        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
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
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="text-lg font-semibold">
                  {harvest.quantity.amount} {harvest.quantity.unit}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="text-xl font-bold text-green-600">
                  ₱{(harvest.basePrice * harvest.quantity.amount).toLocaleString()}
                </span>
              </div>
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
            {user?.role === 'farmer' || user?.role === 'fisherman' ? (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/harvest/${harvestId}/edit`)}
                >
                  Edit Harvest
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleContactSeller}
                disabled={isStartingConversation}
                className="w-full"
                size="lg"
              >
                {isStartingConversation ? 'Starting conversation...' : 'Contact Seller'}
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
                <span className="text-muted-foreground">Harvest Date:</span>
                <span>{new Date(harvest.harvestDate).toLocaleDateString()}</span>
              </div>
              {harvest.expiryDate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expiry Date:</span>
                  <span>{new Date(harvest.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-screen Image Viewer */}
      {selectedImageIndex !== null && harvest && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation buttons */}
            {harvest.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={harvest.images[selectedImageIndex]}
              alt={`Harvest image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image counter */}
            {harvest.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {harvest.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HarvestDetailsPage;




