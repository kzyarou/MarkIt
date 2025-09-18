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
import { CalendarIcon, Upload, X, Plus, Image, Video, FileImage } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Harvest, ProductCategory } from '@/types/markit';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';

const CreateHarvest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

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
        ...(prev[parentField as keyof typeof prev] as Record<string, any>),
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

  const handleMediaUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate file types and sizes
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        alert(`${file.name} is not a valid image or video file.`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Check total file count limit
    if (mediaFiles.length + validFiles.length > 10) {
      alert('Maximum 10 media files allowed.');
      return;
    }

    setUploadingMedia(true);
    
    try {
      // Convert files to base64 for storage in Firestore
      const base64Promises = validFiles.map(async (file) => {
        return new Promise<{ file: File; url: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({ file, url: reader.result as string });
          };
          reader.readAsDataURL(file);
        });
      });
      
      const base64Results = await Promise.all(base64Promises);
      
      setMediaFiles(prev => [...prev, ...base64Results.map(result => result.file)]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...base64Results.map(result => result.url)]
      }));
      
      console.log('Media files converted to base64 successfully');
      
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Error uploading media files. Please try again.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMediaFile = async (index: number) => {
    // Remove from both arrays
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getFileType = (file: File) => {
    if (file.type.startsWith('video/')) return 'video';
    return 'image';
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
        ...(formData.expiryDate && { expiryDate: formData.expiryDate.toISOString() }),
        status: 'available',
        basePrice: parseFloat(formData.basePrice),
        location: {
          address: formData.location.address || user?.location?.address || 'Location not set',
          coordinates: user?.location?.coordinates || { lat: 0, lng: 0 }
        },
        deliveryOptions: {
          pickup: formData.deliveryOptions.pickup,
          delivery: formData.deliveryOptions.delivery,
          ...(formData.deliveryOptions.deliveryRadius && { deliveryRadius: parseFloat(formData.deliveryOptions.deliveryRadius) }),
          ...(formData.deliveryOptions.deliveryFee && { deliveryFee: parseFloat(formData.deliveryOptions.deliveryFee) })
        }
      };

      console.log('Submitting harvest:', harvestData);
      
      // Save to Firestore
      const harvestRef = await addDoc(collection(db, 'harvests'), {
        ...harvestData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Harvest created with ID:', harvestRef.id);
      
      // Navigate to dashboard to see the new post
      navigate('/');
    } catch (error) {
      console.error('Error creating harvest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto overflow-x-hidden pb-mobile-content">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('create_post_title') || 'Post New Harvest'}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {t('create_post_subtitle') || 'Share your harvest with buyers and get fair prices through our bidding system'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('create_basic_info') || 'Basic Information'}</CardTitle>
            <CardDescription>{t('create_basic_info_desc') || 'Tell buyers about your harvest'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('create_title_label') || 'Harvest Title *'}</Label>
                <Input
                  id="title"
                  placeholder={t('create_title_ph') || 'e.g., Fresh Organic Tomatoes'}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('create_category_label') || 'Category *'}</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('create_category_ph') || 'Select category'} />
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
                <Label htmlFor="subcategory">{t('create_subcategory_label') || 'Subcategory *'}</Label>
                <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                  <SelectTrigger className={errors.subcategory ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('create_subcategory_ph') || 'Select subcategory'} />
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
              <Label htmlFor="description">{t('create_description_label') || 'Description *'}</Label>
              <Textarea
                id="description"
                placeholder={t('create_description_ph') || 'Describe your harvest, growing methods, quality, etc.'}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={errors.description ? 'border-red-500' : ''}
                rows={4}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle>{t('create_media') || 'Photos & Videos'}</CardTitle>
            <CardDescription>{t('create_media_desc') || 'Upload photos and videos of your harvest (max 10 files, 10MB each)'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="media-upload"
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
                className="hidden"
                disabled={uploadingMedia}
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-2">
                  {uploadingMedia ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {uploadingMedia ? (t('uploading') || 'Uploading...') : (t('upload_hint') || 'Click to upload or drag and drop')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('upload_types_hint') || 'PNG, JPG, MP4, MOV up to 10MB each'}
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Media Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      {getFileType(mediaFiles[index]) === 'image' ? (
                        <img
                          src={imageUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={imageUrl}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>
                    <button
                      onClick={() => removeMediaFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{mediaFiles[index]?.name || `File ${index + 1}`}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quantity and Quality */}
        <Card>
          <CardHeader>
            <CardTitle>{t('create_quantity_quality') || 'Quantity & Quality'}</CardTitle>
            <CardDescription>{t('create_quantity_quality_desc') || 'Specify the amount and quality of your harvest'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">{t('create_quantity_label') || 'Quantity *'}</Label>
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
                      <SelectValue placeholder={t('unit') || 'Unit'} />
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
                <Label htmlFor="basePrice">{t('create_base_price') || 'Base Price (₱ per unit) *'}</Label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('create_quality_grade') || 'Quality Grade'}</Label>
                <Select value={formData.quality.grade} onValueChange={(value) => handleNestedInputChange('quality', 'grade', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">{t('grade_premium') || 'Premium'}</SelectItem>
                    <SelectItem value="A">{t('grade_a') || 'Grade A'}</SelectItem>
                    <SelectItem value="B">{t('grade_b') || 'Grade B'}</SelectItem>
                    <SelectItem value="C">{t('grade_c') || 'Grade C'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('create_freshness') || 'Freshness'}</Label>
                <Select value={formData.quality.freshness} onValueChange={(value) => handleNestedInputChange('quality', 'freshness', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresh">{t('fresh') || 'Fresh'}</SelectItem>
                    <SelectItem value="frozen">{t('frozen') || 'Frozen'}</SelectItem>
                    <SelectItem value="dried">{t('dried') || 'Dried'}</SelectItem>
                    <SelectItem value="processed">{t('processed') || 'Processed'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('create_certifications') || 'Certifications'}</Label>
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
              <Label htmlFor="organic">{t('create_organic') || 'Organic/All-natural'}</Label>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>{t('create_dates') || 'Important Dates'}</CardTitle>
            <CardDescription>{t('create_dates_desc') || 'Set harvest and expiry dates'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('create_harvest_date') || 'Harvest Date'}</Label>
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
                      {formData.harvestDate ? format(formData.harvestDate, "PPP") : (t('pick_date') || 'Pick a date')}
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
                <Label>{t('create_expiry_date') || 'Expiry Date (Optional)'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiryDate ? format(formData.expiryDate, "PPP") : (t('pick_date') || 'Pick a date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expiryDate}
                      onSelect={(date) => handleInputChange('expiryDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>{t('create_location') || 'Location'}</CardTitle>
            <CardDescription>{t('create_location_desc') || 'Where is your harvest located?'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">{t('create_location_label') || 'Harvest Location *'}</Label>
              <Input
                id="location"
                value={formData.location.address}
                onChange={(e) => handleNestedInputChange('location', 'address', e.target.value)}
                placeholder={t('create_location_ph') || 'Enter your farm or harvest location (e.g., Barangay San Jose, Nueva Ecija)'}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {t('create_location_hint') || 'Be specific about your location to help buyers find you'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Options */}
        <Card>
          <CardHeader>
            <CardTitle>{t('create_delivery') || 'Delivery Options'}</CardTitle>
            <CardDescription>{t('create_delivery_desc') || 'How can buyers receive your harvest?'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pickup"
                  checked={formData.deliveryOptions.pickup}
                  onCheckedChange={(checked) => handleNestedInputChange('deliveryOptions', 'pickup', checked)}
                />
                <Label htmlFor="pickup">{t('create_allow_pickup') || 'Allow pickup from your location'}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delivery"
                  checked={formData.deliveryOptions.delivery}
                  onCheckedChange={(checked) => handleNestedInputChange('deliveryOptions', 'delivery', checked)}
                />
                <Label htmlFor="delivery">{t('create_offer_delivery') || 'Offer delivery service'}</Label>
              </div>

              {formData.deliveryOptions.delivery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryRadius">{t('create_delivery_radius') || 'Delivery Radius (km)'}</Label>
                    <Input
                      id="deliveryRadius"
                      type="number"
                      placeholder="0"
                      value={formData.deliveryOptions.deliveryRadius}
                      onChange={(e) => handleNestedInputChange('deliveryOptions', 'deliveryRadius', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">{t('create_delivery_fee') || 'Delivery Fee (₱)'}</Label>
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
            {t('cancel') || 'Cancel'}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (t('posting') || 'Posting...') : (t('post_harvest') || 'Post Harvest')}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHarvest;

