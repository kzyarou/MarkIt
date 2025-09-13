// MarkIt - Fisherfolk and Farmer Price Guarantee App
// Data models for agricultural and fisheries marketplace

export type UserRole = 'farmer' | 'fisherman' | 'buyer' | 'admin';
export type ProductCategory = 'agricultural' | 'fisheries' | 'livestock' | 'dairy' | 'poultry';
export type BidStatus = 'active' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
export type TransactionStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
export type HarvestStatus = 'available' | 'reserved' | 'sold' | 'expired';

// User Profile
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    region: string;
    province: string;
    city: string;
  };
  businessInfo?: {
    businessName: string;
    businessType: 'individual' | 'cooperative' | 'company' | 'restaurant' | 'school' | 'hospital' | 'retailer';
    licenseNumber?: string;
    description?: string;
  };
  verificationStatus: {
    isVerified: boolean;
    verifiedAt?: string;
    documents: string[]; // URLs to verification documents
  };
  rating: {
    average: number;
    totalReviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Product/Harvest
export interface Harvest {
  id: string;
  farmerId: string;
  farmerName: string;
  title: string;
  description: string;
  category: ProductCategory;
  subcategory: string; // e.g., "Rice", "Tilapia", "Tomatoes"
  quantity: {
    amount: number;
    unit: string; // "kg", "pieces", "crates", "tons"
  };
  quality: {
    grade: 'A' | 'B' | 'C' | 'Premium';
    freshness: 'fresh' | 'frozen' | 'dried' | 'processed';
    organic: boolean;
    certifications: string[]; // e.g., ["Organic", "Fair Trade"]
  };
  images: string[];
  harvestDate: string;
  expiryDate?: string;
  status: HarvestStatus;
  basePrice: number; // Minimum acceptable price per unit
  currentHighestBid?: number;
  biddingEndDate: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  deliveryOptions: {
    pickup: boolean;
    delivery: boolean;
    deliveryRadius?: number; // in kilometers
    deliveryFee?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Bidding System
export interface Bid {
  id: string;
  harvestId: string;
  buyerId: string;
  buyerName: string;
  buyerBusinessType: string;
  amount: number; // Price per unit
  totalAmount: number; // Total price for the entire quantity
  quantity: number; // Quantity they want to buy
  message?: string;
  status: BidStatus;
  isAutoBid: boolean; // For automatic bidding up to a maximum
  maxBidAmount?: number; // For auto-bidding
  createdAt: string;
  updatedAt: string;
}

// Transaction
export interface Transaction {
  id: string;
  harvestId: string;
  farmerId: string;
  buyerId: string;
  bidId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryFee?: number;
  finalAmount: number;
  status: TransactionStatus;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_payment' | 'check';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    contactPerson: string;
    phoneNumber: string;
  };
  deliveryDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Price Guarantee System
export interface PriceGuarantee {
  id: string;
  category: ProductCategory;
  subcategory: string;
  region: string;
  minimumPrice: number; // Guaranteed minimum price per unit
  currentMarketPrice: number;
  priceHistory: {
    date: string;
    price: number;
  }[];
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  createdAt: string;
}

// Review and Rating
export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5 stars
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: 'bid_received' | 'bid_accepted' | 'bid_rejected' | 'harvest_expired' | 'price_alert' | 'transaction_update' | 'system';
  title: string;
  message: string;
  data?: any; // Additional data for the notification
  isRead: boolean;
  createdAt: string;
}

// Market Analytics
export interface MarketData {
  category: ProductCategory;
  subcategory: string;
  region: string;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  totalVolume: number;
  totalTransactions: number;
  priceTrend: 'increasing' | 'decreasing' | 'stable';
  lastUpdated: string;
}

// App Settings
export interface AppSettings {
  id: string;
  userId: string;
  notifications: {
    bidUpdates: boolean;
    priceAlerts: boolean;
    marketUpdates: boolean;
    transactionUpdates: boolean;
  };
  language: string;
  currency: string;
  distanceUnit: 'km' | 'miles';
  theme: 'light' | 'dark' | 'auto';
}

// Search and Filter
export interface SearchFilters {
  category?: ProductCategory;
  subcategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  location?: {
    coordinates: {
      lat: number;
      lng: number;
    };
    radius: number; // in kilometers
  };
  quality?: {
    grade?: string;
    organic?: boolean;
    certifications?: string[];
  };
  deliveryOptions?: {
    pickup?: boolean;
    delivery?: boolean;
  };
  sortBy?: 'price' | 'distance' | 'rating' | 'date' | 'quantity';
  sortOrder?: 'asc' | 'desc';
}

// Dashboard Statistics
export interface DashboardStats {
  totalHarvests: number;
  activeHarvests: number;
  totalBids: number;
  totalTransactions: number;
  totalEarnings: number;
  averageRating: number;
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

