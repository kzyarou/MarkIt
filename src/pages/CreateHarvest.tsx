import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Harvest, ProductCategory } from '@/types/markit';

const CreateHarvest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as ProductCategory | '',
    subcategory: '',
    quantity: {
      amount: '',
      unit: ''
    },
    quality: {
      grade: 'A' as 'A' | 'B' | 'C' | 'Premium',
      freshness: 'fresh' as 'fresh' | 'frozen' | 'dried' | 'processed',
      organic: false,
      certifications: [] as string[]
    },
    images: [] as string[],
    harvestDate: new Date(),
    expiryDate: null as Date | null,
    basePrice: '',
    biddingEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    deliveryOptions: {
      pickup: true,
      delivery: false,
      deliveryRadius: '',
      deliveryFee: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const units = ['kg', 'pieces', 'crates', 'tons', 'liters', 'dozens', 'bags'];

  const certificationOptions = [
    'Organic', 'Fair Trade', 'GAP (Good Agricultural Practices)', 
    'HACCP', 'Halal', 'Kosher', 'Non-GMO'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof typeof prev],
        [childField]: value
      }
    }));
  };

  const handleCertificationToggle = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      quality: {
        ...prev.quality,
        certifications: prev.quality.certifications.includes(certification)
          ? prev.quality.certifications.filter(c => c !== certification)
          : [...prev.quality.certifications, certification]
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.subcategory) newErrors.subcategory = 'Subcategory is required';
    if (!formData.quantity.amount || parseFloat(formData.quantity.amount) <= 0) {
      newErrors.quantityAmount = 'Valid quantity is required';
    }
    if (!formData.quantity.unit) newErrors.quantityUnit = 'Unit is required';
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Valid base price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual Firebase submission
      const harvestData: Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'> = {
        farmerId: user?.id || '',
        farmerName: user?.name || '',
        title: formData.title,
        description: formData.description,
        category: formData.category as ProductCategory,
        subcategory: formData.subcategory,
        quantity: {
          amount: parseFloat(formData.quantity.amount),
          unit: formData.quantity.unit
        },
        quality: formData.quality,
        images: formData.images,
        harvestDate: formData.harvestDate.toISOString(),
        expiryDate: formData.expiryDate?.toISOString(),
        status: 'available',
        basePrice: parseFloat(formData.basePrice),
        biddingEndDate: formData.biddingEndDate.toISOString(),
        location: {
          address: user?.location?.address || '',
          coordinates: user?.location?.coordinates || { lat: 0, lng: 0 }
        },
        deliveryOptions: {
          pickup: formData.deliveryOptions.pickup,
          delivery: formData.deliveryOptions.delivery,
          deliveryRadius: formData.deliveryOptions.deliveryRadius ? parseFloat(formData.deliveryOptions.deliveryRadius) : undefined,
          deliveryFee: formData.deliveryOptions.deliveryFee ? parseFloat(formData.deliveryOptions.deliveryFee) : undefined
        }
      };

      console.log('Submitting harvest:', harvestData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/my-harvests');
    } catch (error) {
      console.error('Error creating harvest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Post New Harvest</h1>
          <p className="text-muted-foreground">
            Share your harvest with buyers and get fair prices through our bidding system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell buyers about your harvest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Harvest Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Fresh Organic Tomatoes"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>
            </div>

            {formData.category && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                  <SelectTrigger className={errors.subcategory ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[formData.category as keyof typeof categories]?.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subcategory && <p className="text-sm text-red-500">{errors.subcategory}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your harvest, growing methods, quality, etc."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={errors.description ? 'border-red-500' : ''}
                rows={4}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Quantity and Quality */}
        <Card>
          <CardHeader>
            <CardTitle>Quantity & Quality</CardTitle>
            <CardDescription>Specify the amount and quality of your harvest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={formData.quantity.amount}
                    onChange={(e) => handleNestedInputChange('quantity', 'amount', e.target.value)}
                    className={errors.quantityAmount ? 'border-red-500' : ''}
                  />
                  <Select value={formData.quantity.unit} onValueChange={(value) => handleNestedInputChange('quantity', 'unit', value)}>
                    <SelectTrigger className={errors.quantityUnit ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(errors.quantityAmount || errors.quantityUnit) && (
                  <p className="text-sm text-red-500">
                    {errors.quantityAmount || errors.quantityUnit}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (₱ per unit) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  placeholder="0.00"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', e.target.value)}
                  className={errors.basePrice ? 'border-red-500' : ''}
                />
                {errors.basePrice && <p className="text-sm text-red-500">{errors.basePrice}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quality Grade</Label>
                <Select value={formData.quality.grade} onValueChange={(value) => handleNestedInputChange('quality', 'grade', value)}>
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

              <div className="space-y-2">
                <Label>Freshness</Label>
                <Select value={formData.quality.freshness} onValueChange={(value) => handleNestedInputChange('quality', 'freshness', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresh">Fresh</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="dried">Dried</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="flex flex-wrap gap-2">
                {certificationOptions.map((cert) => (
                  <Badge
                    key={cert}
                    variant={formData.quality.certifications.includes(cert) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCertificationToggle(cert)}
                  >
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="organic"
                checked={formData.quality.organic}
                onCheckedChange={(checked) => handleNestedInputChange('quality', 'organic', checked)}
              />
              <Label htmlFor="organic">Organic/All-natural</Label>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
            <CardDescription>Set harvest and bidding dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harvest Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.harvestDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.harvestDate ? format(formData.harvestDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.harvestDate}
                      onSelect={(date) => handleInputChange('harvestDate', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Bidding End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.biddingEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.biddingEndDate ? format(formData.biddingEndDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.biddingEndDate}
                      onSelect={(date) => handleInputChange('biddingEndDate', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Options */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Options</CardTitle>
            <CardDescription>How can buyers receive your harvest?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pickup"
                  checked={formData.deliveryOptions.pickup}
                  onCheckedChange={(checked) => handleNestedInputChange('deliveryOptions', 'pickup', checked)}
                />
                <Label htmlFor="pickup">Allow pickup from your location</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delivery"
                  checked={formData.deliveryOptions.delivery}
                  onCheckedChange={(checked) => handleNestedInputChange('deliveryOptions', 'delivery', checked)}
                />
                <Label htmlFor="delivery">Offer delivery service</Label>
              </div>

              {formData.deliveryOptions.delivery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                    <Input
                      id="deliveryRadius"
                      type="number"
                      placeholder="0"
                      value={formData.deliveryOptions.deliveryRadius}
                      onChange={(e) => handleNestedInputChange('deliveryOptions', 'deliveryRadius', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Delivery Fee (₱)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      placeholder="0.00"
                      value={formData.deliveryOptions.deliveryFee}
                      onChange={(e) => handleNestedInputChange('deliveryOptions', 'deliveryFee', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/my-harvests')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Harvest'}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHarvest;

