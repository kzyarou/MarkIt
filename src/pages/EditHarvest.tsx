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
import { ArrowLeft, Save, Package, MapPin, DollarSign, Calendar, Trash2 } from 'lucide-react';
import { Harvest } from '@/types/markit';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
    harvestDate: new Date(),
    expiryDate: null as Date | null,
    location: {
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    deliveryOptions: {
      pickup: true,
      delivery: false,
      deliveryRadius: '',
      deliveryFee: ''
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
      setFormData({
        title: harvestWithId.title,
        description: harvestWithId.description,
        category: harvestWithId.category,
        subcategory: harvestWithId.subcategory,
        quantity: harvestWithId.quantity,
        quality: harvestWithId.quality,
        basePrice: harvestWithId.basePrice,
        harvestDate: new Date(harvestWithId.harvestDate),
        expiryDate: harvestWithId.expiryDate ? new Date(harvestWithId.expiryDate) : null,
        location: harvestWithId.location,
        deliveryOptions: harvestWithId.deliveryOptions || {
          pickup: true,
          delivery: false,
          deliveryRadius: '',
          deliveryFee: ''
        }
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

      if (!harvestId) {
        toast.error('No harvest ID found');
        return;
      }

      // Update Firestore
      const updateData = {
        ...formData,
        harvestDate: formData.harvestDate.toISOString(),
        ...(formData.expiryDate && { expiryDate: formData.expiryDate.toISOString() }),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'harvests', harvestId), updateData);

      toast.success('Harvest updated successfully!');
      navigate('/mydashboard');
    } catch (error) {
      console.error('Error updating harvest:', error);
      toast.error('Failed to update harvest');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!harvestId) {
      toast.error('No harvest ID found');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this harvest? This action cannot be undone.');
    
    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      await deleteDoc(doc(db, 'harvests', harvestId));
      toast.success('Harvest deleted successfully!');
      navigate('/mydashboard');
    } catch (error) {
      console.error('Error deleting harvest:', error);
      toast.error('Failed to delete harvest');
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
              <CardDescription>Set the location and harvest dates</CardDescription>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="harvestDate">Harvest Date *</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={formData.harvestDate.toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('harvestDate', new Date(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate ? formData.expiryDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value ? new Date(e.target.value) : null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
              <CardDescription>Configure pickup and delivery options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pickup"
                  checked={formData.deliveryOptions.pickup}
                  onCheckedChange={(checked) => handleInputChange('deliveryOptions.pickup', checked)}
                />
                <Label htmlFor="pickup">Available for Pickup</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delivery"
                  checked={formData.deliveryOptions.delivery}
                  onCheckedChange={(checked) => handleInputChange('deliveryOptions.delivery', checked)}
                />
                <Label htmlFor="delivery">Available for Delivery</Label>
              </div>

              {formData.deliveryOptions.delivery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                    <Input
                      id="deliveryRadius"
                      type="number"
                      value={formData.deliveryOptions.deliveryRadius}
                      onChange={(e) => handleInputChange('deliveryOptions.deliveryRadius', e.target.value)}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryFee">Delivery Fee (₱)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      value={formData.deliveryOptions.deliveryFee}
                      onChange={(e) => handleInputChange('deliveryOptions.deliveryFee', e.target.value)}
                      placeholder="50"
                    />
                  </div>
                </div>
              )}
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
                onClick={() => navigate('/mydashboard')}
                className="w-full"
              >
                Cancel
              </Button>

              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={saving}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Harvest
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
                <div className="flex items-center justify-between text-sm">
                  <span>Freshness:</span>
                  <Badge variant="outline">{formData.quality.freshness}</Badge>
                </div>
                {formData.quality.organic && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Organic
                  </Badge>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span>Harvest Date:</span>
                  <span className="font-medium">{formData.harvestDate.toLocaleDateString()}</span>
                </div>
                {formData.expiryDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Expiry Date:</span>
                    <span className="font-medium">{formData.expiryDate.toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span>Location:</span>
                  <span className="font-medium">{formData.location.address || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Pickup:</span>
                  <Badge variant={formData.deliveryOptions.pickup ? "default" : "secondary"}>
                    {formData.deliveryOptions.pickup ? "Available" : "Not Available"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Delivery:</span>
                  <Badge variant={formData.deliveryOptions.delivery ? "default" : "secondary"}>
                    {formData.deliveryOptions.delivery ? "Available" : "Not Available"}
                  </Badge>
                </div>
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


