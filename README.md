# MarkIt: Fisherfolk and Farmer Price Guarantee App

A comprehensive marketplace platform that connects farmers and fisherfolk directly with buyers, ensuring fair prices and eliminating middleman exploitation.

## 🌾 Overview

MarkIt is an international platform designed to revolutionize agricultural trading by providing a direct connection between producers (farmers and fisherfolk) and buyers (restaurants, cooperatives, schools). The app features a unique price guarantee system that ensures fair compensation for agricultural producers.

## ✨ Key Features

### For Farmers & Fisherfolk
- **Harvest Posting**: Create detailed listings for your agricultural products
- **Quality Documentation**: Specify grade, freshness, certifications, and organic status
- **Price Guarantee**: Set minimum prices with bidding system for fair compensation
- **Direct Communication**: Connect directly with buyers without middlemen
- **Location Services**: Specify pickup and delivery options

### For Buyers
- **Browse Harvests**: Discover fresh products from local farmers and fisherfolk
- **Bidding System**: Place competitive bids on available harvests
- **Quality Assurance**: Access detailed quality information and certifications
- **Fair Pricing**: Transparent pricing without hidden markups
- **Direct Sourcing**: Build relationships with producers

### General Features
- **User Roles**: Farmers, Fishermen, Buyers, and Admin roles
- **Real-time Bidding**: Live bidding system with notifications
- **Price Calculator**: Tools for fair price determination
- **Mobile Responsive**: Optimized for mobile and desktop use
- **International Support**: Multi-country phone number formatting

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PWA**: Service Worker, Offline Support

## 📱 User Interface

- **Rich Green Theme**: Agricultural-inspired color scheme
- **Instagram-style Navigation**: Modern sidebar with user profile
- **Mobile-first Design**: Responsive across all devices
- **Intuitive Forms**: Streamlined harvest posting and bidding
- **Real-time Updates**: Live notifications and status updates

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and Firebase config
├── pages/              # Application pages
├── services/           # API and service layer
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kzyarou/MarkIt.git
   cd MarkIt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `src/lib/firebase.ts` with your config

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password, Google)
3. Create Firestore database
4. Update the configuration in `src/lib/firebase.ts`

### Environment Variables
Create a `.env.local` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 📊 Data Models

### User
- Profile information, role, location, business details
- Verification status and rating system

### Harvest
- Product details, quantity, quality specifications
- Pricing, bidding, and location information

### Bid
- Bidder information, amount, timestamp
- Status and acceptance tracking

### Transaction
- Payment processing, delivery coordination
- Completion and review tracking

## 🌍 International Features

- **Multi-language Support**: Ready for internationalization
- **Phone Number Formatting**: International phone number validation
- **Currency Support**: Multi-currency price display
- **Regional Settings**: Location-based features

## 🔒 Security Features

- **Role-based Access Control**: Secure user permissions
- **Data Validation**: Client and server-side validation
- **Secure Authentication**: Firebase Auth integration
- **Privacy Protection**: User data encryption

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Installable**: Add to home screen
- **Push Notifications**: Real-time updates
- **Background Sync**: Data synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- React community for excellent libraries
- Agricultural communities for inspiration
- Open source contributors

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [Link to docs]

## 🔮 Future Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] AI-powered price recommendations
- [ ] Blockchain integration for transparency

---

**MarkIt** - Empowering farmers and fisherfolk with fair prices and direct market access. 🌾🐟