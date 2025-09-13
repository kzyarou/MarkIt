import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const PriceCalculatorPage = () => {
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    quantity: '',
    unit: 'kg',
    quality: 'A',
    region: '',
    productionCost: '',
    desiredMargin: '20'
  });

  const [calculatedPrice, setCalculatedPrice] = useState<{
    basePrice: number;
    marketPrice: number;
    recommendedPrice: number;
    profitMargin: number;
    totalValue: number;
  } | null>(null);

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

  const regions = [
    'National Capital Region',
    'Central Luzon',
    'Calabarzon',
    'Mimaropa',
    'Bicol Region',
    'Western Visayas',
    'Central Visayas',
    'Eastern Visayas',
    'Zamboanga Peninsula',
    'Northern Mindanao',
    'Davao Region',
    'Soccsksargen',
    'Caraga',
    'Cordillera Administrative Region',
    'Cagayan Valley',
    'Ilocos Region'
  ];

  const units = ['kg', 'pieces', 'crates', 'tons', 'liters', 'dozens', 'bags'];

  const qualityMultipliers = {
    'Premium': 1.3,
    'A': 1.0,
    'B': 0.8,
    'C': 0.6
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculatePrice = () => {
    if (!formData.category || !formData.subcategory || !formData.quantity || !formData.productionCost) {
      alert('Please fill in all required fields');
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const productionCost = parseFloat(formData.productionCost);
    const desiredMargin = parseFloat(formData.desiredMargin);
    const qualityMultiplier = qualityMultipliers[formData.quality as keyof typeof qualityMultipliers] || 1.0;

    // Mock market data - in real app, this would come from Firebase
    const mockMarketPrices: Record<string, number> = {
      'Rice': 35,
      'Corn': 25,
      'Tomatoes': 45,
      'Fish': 120,
      'Shrimp': 200,
      'Crab': 180,
      'Chicken': 150,
      'Eggs': 8
    };

    const baseMarketPrice = mockMarketPrices[formData.subcategory] || 50;
    const marketPrice = baseMarketPrice * qualityMultiplier;
    const costPerUnit = productionCost / quantity;
    const basePrice = costPerUnit * (1 + desiredMargin / 100);
    const recommendedPrice = Math.max(basePrice, marketPrice * 0.9); // At least 90% of market price
    const profitMargin = ((recommendedPrice - costPerUnit) / costPerUnit) * 100;
    const totalValue = recommendedPrice * quantity;

    setCalculatedPrice({
      basePrice,
      marketPrice,
      recommendedPrice,
      profitMargin,
      totalValue
    });
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Price Calculator</h1>
        <p className="text-muted-foreground">
          Calculate fair prices for your harvests based on production costs and market data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Price Calculator</span>
            </CardTitle>
            <CardDescription>
              Enter your harvest details to calculate recommended pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
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
              </div>

              {formData.category && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory *</Label>
                  <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                    <SelectTrigger>
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
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quality">Quality Grade</Label>
                <Select value={formData.quality} onValueChange={(value) => handleInputChange('quality', value)}>
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
                <Label htmlFor="region">Region</Label>
                <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionCost">Total Production Cost (₱) *</Label>
              <Input
                id="productionCost"
                type="number"
                placeholder="0.00"
                value={formData.productionCost}
                onChange={(e) => handleInputChange('productionCost', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include all costs: seeds, fertilizer, labor, equipment, etc.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredMargin">Desired Profit Margin (%)</Label>
              <Input
                id="desiredMargin"
                type="number"
                placeholder="20"
                value={formData.desiredMargin}
                onChange={(e) => handleInputChange('desiredMargin', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 15-25% for sustainable farming
              </p>
            </div>

            <Button onClick={calculatePrice} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Price
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {calculatedPrice ? (
            <>
              {/* Price Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Calculated Prices</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-muted-foreground">Recommended Price:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₱{calculatedPrice.recommendedPrice.toFixed(2)}/{formData.unit}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-muted-foreground">Market Price:</span>
                      <span className="text-lg font-semibold text-green-600">
                        ₱{calculatedPrice.marketPrice.toFixed(2)}/{formData.unit}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-muted-foreground">Base Price (Cost + Margin):</span>
                      <span className="text-lg font-semibold text-orange-600">
                        ₱{calculatedPrice.basePrice.toFixed(2)}/{formData.unit}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        ₱{calculatedPrice.totalValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Profit Margin:</span>
                      <span className={`text-lg font-semibold ${calculatedPrice.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {calculatedPrice.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5" />
                    <span>Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {calculatedPrice.recommendedPrice >= calculatedPrice.marketPrice * 0.9 ? (
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Good Pricing</p>
                        <p className="text-xs text-green-700">
                          Your recommended price is competitive with market rates
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Consider Market Price</p>
                        <p className="text-xs text-orange-700">
                          Your cost-based price is below market rate. Consider increasing to ₱{calculatedPrice.marketPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}

                  {calculatedPrice.profitMargin < 15 ? (
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Low Profit Margin</p>
                        <p className="text-xs text-red-700">
                          Consider reducing production costs or increasing price for better profitability
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Healthy Profit Margin</p>
                        <p className="text-xs text-green-700">
                          Your profit margin is sustainable for long-term farming
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Quality Premium</p>
                      <p className="text-xs text-blue-700">
                        {formData.quality} grade adds {((qualityMultipliers[formData.quality as keyof typeof qualityMultipliers] || 1) - 1) * 100}% value to market price
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Calculate Your Price</h3>
                <p className="text-muted-foreground">
                  Fill in the form to get personalized pricing recommendations for your harvest
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pricing Tips</CardTitle>
          <CardDescription>
            Best practices for setting competitive and profitable prices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Cost Considerations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Include all direct costs: seeds, fertilizer, labor</li>
                <li>• Factor in indirect costs: equipment, land, utilities</li>
                <li>• Consider seasonal variations in input costs</li>
                <li>• Account for post-harvest handling and storage</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Market Factors</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Research current market prices in your region</li>
                <li>• Consider supply and demand fluctuations</li>
                <li>• Factor in quality premiums for organic/certified products</li>
                <li>• Monitor competitor pricing strategies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceCalculatorPage;




