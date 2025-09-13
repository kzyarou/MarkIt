import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Package, MapPin, DollarSign, Calendar } from 'lucide-react';
import { Harvest } from '@/types/markit';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

const EditHarvest = () => {
  const { harvestId } = useParams<{ harvestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [harvest, setHarvest] = useState<Harvest | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    quantity: { amount: 0, unit: 'kg' },
    quality: {
      grade: 'A',
      freshness: 'fresh',
      organic: false,
      certifications: [] as string[]
    },
    basePrice: 0,
    biddingEndDate: '',
    location: {
      address: '',
      coordinates: { lat: 0, lng: 0 }
    }
  });

  useEffect(() => {
    if (harvestId) {
      loadHarvest();
    }
  }, [harvestId]);

  const loadHarvest = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since we don't have Firebase integration yet
      // In a real app, you would fetch from Firestore:
      // const harvestDoc = await getDoc(doc(db, 'harvests', harvestId));
      
      // Mock harvest data
      const mockHarvest: Harvest = {
        id: harvestId!,
        farmerId: user?.id || 'current-user',
        farmerName: user?.name || 'You',
        title: 'Premium Organic Rice',
        description: 'High-quality organic rice from my farm. No pesticides used.',
        category: 'agricultural',
        subcategory: 'Rice',
        quantity: { amount: 50, unit: 'kg' },
        quality: { grade: 'A', freshness: 'fresh', organic: true, certifications: ['Organic'] },
        basePrice: 50,
        currentHighestBid: 65,
        biddingEndDate: '2024-01-20T18:00:00Z',
        status: 'available',
        location: { address: user?.location?.address || 'Your Location', coordinates: { lat: 0, lng: 0 } },
        images: [],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      };

      setHarvest(mockHarvest);
      setFormData({
        title: mockHarvest.title,
        description: mockHarvest.description,
        category: mockHarvest.category,
        subcategory: mockHarvest.subcategory,
        quantity: mockHarvest.quantity,
        quality: mockHarvest.quality,
        basePrice: mockHarvest.basePrice,
        biddingEndDate: mockHarvest.biddingEndDate.split('T')[0], // Convert to date input format
        location: mockHarvest.location
      });
    } catch (error) {
      console.error('Error loading harvest:', error);
      toast.error('Failed to load harvest details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate form
      if (!formData.title.trim()) {
        toast.error('Please enter a title');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Please enter a description');
        return;
      }
      if (formData.basePrice <= 0) {
        toast.error('Please enter a valid base price');
        return;
      }
      if (formData.quantity.amount <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      // In a real app, you would update Firestore:
      // await updateDoc(doc(db, 'harvests', harvestId!), {
      //   ...formData,
      //   updatedAt: new Date().toISOString()
      // });

      toast.success('Harvest updated successfully!');
      navigate(`/harvest/${harvestId}`);
    } catch (error) {
      console.error('Error updating harvest:', error);
      toast.error('Failed to update harvest');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!harvest) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Harvest not found</p>
            <Button asChild className="mt-4">
              <button onClick={() => navigate('/')}>Go Back</button>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Harvest</h1>
          <p className="text-muted-foreground">Update your harvest details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>Enter the basic details of your harvest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Premium Organic Rice"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your harvest, growing methods, quality, etc."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agricultural">Agricultural</SelectItem>
                      <SelectItem value="fisheries">Fisheries</SelectItem>
                      <SelectItem value="livestock">Livestock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory *</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    placeholder="e.g., Rice, Tilapia, Chicken"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Quantity & Pricing</span>
              </CardTitle>
              <CardDescription>Set the quantity and base price for your harvest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity.amount}
                    onChange={(e) => handleInputChange('quantity.amount', parseInt(e.target.value) || 0)}
                    placeholder="50"
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.quantity.unit} onValueChange={(value) => handleInputChange('quantity.unit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="basePrice">Base Price (per kg) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quality & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Quality & Certifications</CardTitle>
              <CardDescription>Specify the quality grade and certifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">Quality Grade</Label>
                  <Select value={formData.quality.grade} onValueChange={(value) => handleInputChange('quality.grade', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="A">Grade A</SelectItem>
                      <SelectItem value="B">Grade B</SelectItem>
                      <SelectItem value="C">Grade C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="freshness">Freshness</Label>
                  <Select value={formData.quality.freshness} onValueChange={(value) => handleInputChange('quality.freshness', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresh">Fresh</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="dried">Dried</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="organic"
                  checked={formData.quality.organic}
                  onCheckedChange={(checked) => handleInputChange('quality.organic', checked)}
                />
                <Label htmlFor="organic">Organic</Label>
              </div>
            </CardContent>
          </Card>

          {/* Location & Timing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Location & Timing</span>
              </CardTitle>
              <CardDescription>Set the location and bidding end date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Location Address</Label>
                <Input
                  id="address"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  placeholder="Enter your location"
                />
              </div>

              <div>
                <Label htmlFor="biddingEndDate">Bidding End Date *</Label>
                <Input
                  id="biddingEndDate"
                  type="datetime-local"
                  value={formData.biddingEndDate}
                  onChange={(e) => handleInputChange('biddingEndDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Save Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate(`/harvest/${harvestId}`)}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your harvest will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold">{formData.title || 'Harvest Title'}</h3>
                <p className="text-sm text-muted-foreground">by {user?.name || 'You'}</p>
                <p className="text-sm">{formData.description || 'Description...'}</p>
                <div className="flex items-center justify-between text-sm">
                  <span>Quantity:</span>
                  <span className="font-medium">{formData.quantity.amount} {formData.quantity.unit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Base Price:</span>
                  <span className="font-medium">₱{formData.basePrice}/kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Grade:</span>
                  <Badge variant="secondary">{formData.quality.grade}</Badge>
                </div>
                {formData.quality.organic && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Organic
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EditHarvest;


