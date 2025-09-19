import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, MapPin, Briefcase, CheckCircle } from "lucide-react";
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth } from '@/lib/firebase';

const steps = [
  { id: 1, title: "Personal Information", icon: User },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Account Type", icon: Briefcase },
  { id: 4, title: "Verification", icon: CheckCircle }
];

// Comprehensive Philippine regions and provinces data
const philippineRegions = {
  "NCR": {
    name: "National Capital Region",
    provinces: ["Metro Manila"]
  },
  "CAR": {
    name: "Cordillera Administrative Region",
    provinces: ["Abra", "Apayao", "Benguet", "Ifugao", "Kalinga", "Mountain Province"]
  },
  "Region I": {
    name: "Ilocos Region",
    provinces: ["Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan"]
  },
  "Region II": {
    name: "Cagayan Valley",
    provinces: ["Batanes", "Cagayan", "Isabela", "Nueva Vizcaya", "Quirino"]
  },
  "Region III": {
    name: "Central Luzon",
    provinces: ["Aurora", "Bataan", "Bulacan", "Nueva Ecija", "Pampanga", "Tarlac", "Zambales"]
  },
  "Region IV-A": {
    name: "CALABARZON",
    provinces: ["Batangas", "Cavite", "Laguna", "Quezon", "Rizal"]
  },
  "Region IV-B": {
    name: "MIMAROPA",
    provinces: ["Marinduque", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Romblon"]
  },
  "Region V": {
    name: "Bicol Region",
    provinces: ["Albay", "Camarines Norte", "Camarines Sur", "Catanduanes", "Masbate", "Sorsogon"]
  },
  "Region VI": {
    name: "Western Visayas",
    provinces: ["Aklan", "Antique", "Capiz", "Guimaras", "Iloilo", "Negros Occidental"]
  },
  "Region VII": {
    name: "Central Visayas",
    provinces: ["Bohol", "Cebu", "Negros Oriental", "Siquijor"]
  },
  "Region VIII": {
    name: "Eastern Visayas",
    provinces: ["Biliran", "Eastern Samar", "Leyte", "Northern Samar", "Samar", "Southern Leyte"]
  },
  "Region IX": {
    name: "Zamboanga Peninsula",
    provinces: ["Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"]
  },
  "Region X": {
    name: "Northern Mindanao",
    provinces: ["Bukidnon", "Camiguin", "Lanao del Norte", "Misamis Occidental", "Misamis Oriental"]
  },
  "Region XI": {
    name: "Davao Region",
    provinces: ["Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental"]
  },
  "Region XII": {
    name: "SOCCSKSARGEN",
    provinces: ["Cotabato", "Sarangani", "South Cotabato", "Sultan Kudarat"]
  },
  "Region XIII": {
    name: "Caraga",
    provinces: ["Agusan del Norte", "Agusan del Sur", "Dinagat Islands", "Surigao del Norte", "Surigao del Sur"]
  },
  "BARMM": {
    name: "Bangsamoro Autonomous Region in Muslim Mindanao",
    provinces: ["Basilan", "Lanao del Sur", "Maguindanao", "Sulu", "Tawi-Tawi"]
  }
};

export default function AuthPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashTransition, setSplashTransition] = useState('opacity-100 scale-100');
  const [cardTransition, setCardTransition] = useState('opacity-0 scale-90 pointer-events-none');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Onboarding state
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState({
    // Step 1
    fullName: "",
    phoneNumber: "",
    email: "",
    
    // Step 2
    region: "",
    province: "",
    municipality: "",
    barangay: "",
    
    // Step 3
    accountType: "", // seller or consumer
    operationType: "", // farming, fishing, or both (for sellers only)
    primaryProducts: "",
    yearsExperience: "",
    farmSize: "",
    description: "",
    // Seller verification
    documentType: "", // 'BIR' | 'BarangayClearance'
    // Note: file kept in state only for UX; actual upload handled after signup elsewhere
    // Using any typing here to avoid importing File type in TSX JSX context
    documentFile: undefined as any,
    
    // Step 4
    password: "",
    confirmPassword: ""
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashTransition('opacity-0 scale-90 pointer-events-none');
      setCardTransition('opacity-100 scale-100');
      setTimeout(() => setShowSplash(false), 500); // Wait for transition
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // New handler functions
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleInputChange = (field: string, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  // Validation helpers
  const isValidFullName = signupData.fullName.trim().length > 1;
  const isValidPhone = /^(\+63|0)9\d{9}$/.test(signupData.phoneNumber.replace(/\s/g, ''));
  const isValidEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signupData.email.trim());
  const isValidRegion = signupData.region.trim().length > 0;
  const isValidProvince = signupData.province.trim().length > 0;
  const isValidMunicipality = signupData.municipality.trim().length > 0;
  const isValidBarangay = signupData.barangay.trim().length > 0;
  const isValidAccountType = signupData.accountType.trim().length > 0;
  const isValidOperationType = signupData.accountType === 'consumer' || signupData.operationType.trim().length > 0;
  const isValidPrimaryProducts = signupData.accountType === 'consumer' || signupData.primaryProducts.trim().length > 0;
  const isValidPassword = signupData.password.length >= 6;
  const isPasswordMatch = signupData.password === signupData.confirmPassword;
  const isValidSellerDocs = signupData.accountType !== 'seller' || (signupData.documentType === 'BIR' || signupData.documentType === 'BarangayClearance');

  // Get available provinces based on selected region
  const getAvailableProvinces = () => {
    if (!signupData.region) return [];
    return philippineRegions[signupData.region as keyof typeof philippineRegions]?.provinces || [];
  };

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('63')) {
      return `+63 ${cleaned.slice(2, 6)} ${cleaned.slice(6, 10)} ${cleaned.slice(10)}`;
    } else if (cleaned.startsWith('0')) {
      return `0${cleaned.slice(1, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9)}`;
    } else if (cleaned.length > 0) {
      return `0${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
    }
    return value;
  };

    // Name step
    ({ signupData, setSignupData, progress, isValidName, setSignupStep }) => (
      <>
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-green-900">Let's create your profile</div>
        <label className="block mb-2 text-green-900 text-base sm:text-lg">What's your name?</label>
        <input
          type="text"
          className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
          value={signupData.name}
          onChange={e => setSignupData({ ...signupData, name: e.target.value })}
          placeholder="Full Name"
          autoFocus
        />
        <button
          className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-green-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gradient-to-r from-green-600 to-green-400 text-white"
          disabled={!isValidName}
          onClick={() => setSignupStep(1)}
          style={{background: 'none'}}
        >
          <span className="absolute left-0 top-0 h-full rounded-lg" style={{width: `${progress * 100}%`, background: isValidName ? 'linear-gradient(to right, #2563eb, #60a5fa)' : '#e5e7eb', transition: 'width 0.3s'}}></span>
          <span className="relative z-10 text-white font-bold">Next</span>
        </button>
      </>
    ),
    // Role step
    ({ signupData, setSignupData, progress, isValidRole, setSignupStep }) => (
      <>
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-green-900">Let's create your profile</div>
        <div className="text-2xl font-bold mb-6 text-green-900">What's your role?</div>
        <div className="flex flex-col gap-3 mb-6">
          <button
            className={`border rounded-full px-4 py-3 text-left font-semibold transition shadow-sm ${signupData.role === 'student' ? 'bg-[#e7fbe7] border-[#4ade80] text-black' : 'bg-white text-black'} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500`}
            onClick={() => setSignupData({ ...signupData, role: 'student' })}
            type="button"
          >Student</button>
          <button
            className={`border rounded-full px-4 py-3 text-left font-semibold transition shadow-sm ${signupData.role === 'teacher' ? 'bg-[#e7fbe7] border-[#4ade80] text-black' : 'bg-white text-black'} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500`}
            onClick={() => setSignupData({ ...signupData, role: 'teacher' })}
            type="button"
          >Teacher</button>
        </div>
        <button
          className="w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-green-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gradient-to-r from-green-600 to-green-400 text-white"
          disabled={!isValidRole}
          onClick={() => setSignupStep(2)}
          style={{background: 'none'}}
        >
          <span className="absolute left-0 top-0 h-full rounded-lg" style={{width: `${progress * 100}%`, background: isValidRole ? 'linear-gradient(to right, #2563eb, #60a5fa)' : '#e5e7eb', transition: 'width 0.3s'}}></span>
          <span className="relative z-10 text-white font-bold">Next</span>
        </button>
      </>
    ),
    // Gender step (new, after role)
    ({ signupData, setSignupData, progress, isValidGender, setSignupStep }) => (
      <>
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-green-900">Let's create your profile</div>
        <div className="text-2xl font-bold mb-6 text-green-900">What's your gender?</div>
        <div className="flex flex-col gap-3 mb-6">
          <button
            className={`border rounded-full px-4 py-3 text-left font-semibold transition shadow-sm ${signupData.gender === 'male' ? 'bg-[#e7fbe7] border-[#4ade80] text-black' : 'bg-white text-black'} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500`}
            onClick={() => setSignupData({ ...signupData, gender: 'male' })}
            type="button"
          >Male</button>
          <button
            className={`border rounded-full px-4 py-3 text-left font-semibold transition shadow-sm ${signupData.gender === 'female' ? 'bg-[#e7fbe7] border-[#4ade80] text-black' : 'bg-white text-black'} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500`}
            onClick={() => setSignupData({ ...signupData, gender: 'female' })}
            type="button"
          >Female</button>
        </div>
        <button
          className="w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-green-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gradient-to-r from-green-600 to-green-400 text-white"
          disabled={!isValidGender}
          onClick={() => setSignupStep(3)}
          style={{background: 'none'}}
        >
          <span className="absolute left-0 top-0 h-full rounded-lg" style={{width: `${progress * 100}%`, background: isValidGender ? 'linear-gradient(to right, #2563eb, #60a5fa)' : '#e5e7eb', transition: 'width 0.3s'}}></span>
          <span className="relative z-10 text-white font-bold">Next</span>
        </button>
      </>
    ),
    // Details step (student: LRN, teacher: EmpId)
    ({ signupData, setSignupData, progress, isValidLrn, isValidEmpId, setSignupStep }) => (
      <>
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-green-900">Let's create your profile</div>
        {signupData.role === 'student' ? (
          <>
            <label className="block mb-2 text-green-900 dark:text-white">What’s your LRN? (12 digits)</label>
            <input
              type="text"
              className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
              value={signupData.lrn}
              onChange={e => setSignupData({ ...signupData, lrn: e.target.value.replace(/[^0-9]/g, '').slice(0,12) })}
              placeholder="Learner Reference Number"
              maxLength={12}
            />
            <button
              className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-green-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gradient-to-r from-green-600 to-green-400 text-white"
              disabled={!isValidLrn}
              onClick={() => setSignupStep(4)}
              style={{background: 'none'}}
            >
              <span className="absolute left-0 top-0 h-full rounded-lg" style={{width: `${progress * 100}%`, background: isValidLrn ? 'linear-gradient(to right, #2563eb, #60a5fa)' : '#e5e7eb', transition: 'width 0.3s'}}></span>
              <span className="relative z-10 text-white font-bold">Next</span>
            </button>
          </>
        ) : (
          <>
            <label className="block mb-2 text-green-900 dark:text-white">What's your DepEd Employee Number?</label>
            <input
              type="text"
              className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
              value={signupData.empId}
              onChange={e => setSignupData({ ...signupData, empId: e.target.value })}
              placeholder="DepEd Employee Number"
            />
            <button
              className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-green-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gradient-to-r from-green-600 to-green-400 text-white"
              disabled={!isValidEmpId}
              onClick={() => setSignupStep(4)}
              style={{background: 'none'}}
            >
              <span className="absolute left-0 top-0 h-full rounded-lg" style={{width: `${progress * 100}%`, background: isValidEmpId ? 'linear-gradient(to right, #2563eb, #60a5fa)' : '#e5e7eb', transition: 'width 0.3s'}}></span>
              <span className="relative z-10 text-white font-bold">Next</span>
            </button>
          </>
        )}
      </>
    ),
    // Age step
    ({ signupData, setSignupData, progress, isValidAge, setSignupStep }) => (
      <>
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-green-900">Let's create your profile</div>
        <label className="block mb-2 text-green-900 dark:text-white">How old are you?</label>
        <input
          type="number"
          className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
          value={signupData.age}
          onChange={e => setSignupData({ ...signupData, age: e.target.value.replace(/[^0-9]/g, '') })}
          placeholder="Age"
          min={signupData.role === 'teacher' ? 18 : 5}
          max={99}
        />
        <button
          className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-green-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gradient-to-r from-green-600 to-green-400 text-white"
          disabled={!isValidAge}
          onClick={() => setSignupStep(5)}
          style={{background: 'none'}}
        >
          <span className="absolute left-0 top-0 h-full rounded-lg" style={{width: `${progress * 100}%`, background: isValidAge ? 'linear-gradient(to right, #2563eb, #60a5fa)' : '#e5e7eb', transition: 'width 0.3s'}}></span>
          <span className="relative z-10 text-white font-bold">Next</span>
        </button>
      </>
    ),
    // Grade Level step (student only)
    ({ signupData, setSignupData, progress, isValidGradeLevel, setSignupStep }) => (
      signupData.role === 'student' ? (
        <>
          <div className="text-3xl sm:text-4xl font-bold mb-10 text-green-900">Let's create your profile</div>
          <label className="block mb-2 text-green-900 dark:text-white">What grade are you in? (7-12)</label>
          <input
            type="number"
            min={7}
            max={12}
            className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
            value={signupData.gradeLevel}
            onChange={e => {
              let val = e.target.value.replace(/[^0-9]/g, '');
              if (val.length > 2) val = val.slice(0, 2);
              if (Number(val) < 7) val = '7';
              if (Number(val) > 12) val = '12';
              setSignupData({ ...signupData, gradeLevel: val });
            }}
            placeholder="Enter your grade (7-12)"
          />
          <button
            className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-green-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gradient-to-r from-green-600 to-green-400 text-white"
            disabled={!isValidGradeLevel}
            onClick={() => setSignupStep(6)}
            style={{background: 'none'}}
          >
            <span className="absolute left-0 top-0 h-full rounded-lg" style={{width: `${progress * 100}%`, background: isValidGradeLevel ? 'linear-gradient(to right, #2563eb, #60a5fa)' : '#e5e7eb', transition: 'width 0.3s'}}></span>
            <span className="relative z-10 text-white font-bold">Next</span>
          </button>
        </>
      ) : null
    ),
    // Email step
    ({ signupData, setSignupData, progress, isValidEmail, setSignupStep }) => (
      <>
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-green-900">Let's create your profile</div>
        <label className="block mb-2 text-green-900 dark:text-white">What's your email?</label>
        <input
          type="email"
          className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
          value={signupData.email}
          onChange={e => setSignupData({ ...signupData, email: e.target.value.trimStart() })}
          placeholder="Email"
        />
        <button
          className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-green-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gradient-to-r from-green-600 to-green-400 text-white"
          disabled={!isValidEmail}
          onClick={() => setSignupStep(7)}
          style={{background: 'none'}}
        >
          <span className="absolute left-0 top-0 h-full rounded-lg" style={{width: `${progress * 100}%`, background: isValidEmail ? 'linear-gradient(to right, #2563eb, #60a5fa)' : '#e5e7eb', transition: 'width 0.3s'}}></span>
          <span className="relative z-10 text-white font-bold">Next</span>
        </button>
      </>
    ),
    // Password step (final)
    ({ signupData, setSignupData, isValidPassword, isPasswordMatch, handleFinalSignup }) => (
      <>
        <div className="text-2xl font-bold mb-6 text-green-900 dark:text-white">Set a Password</div>
        <label className="block mb-2 text-green-900 dark:text-white">Set a password</label>
        <input
          type="password"
          className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
          value={signupData.password}
          onChange={e => setSignupData({ ...signupData, password: e.target.value })}
          placeholder="Password (min 6 chars)"
        />
        <label className="block mt-4 mb-2 text-green-900 dark:text-white">Confirm your password</label>
        <input
          type="password"
          className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
          value={signupData.confirmPassword}
          onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })}
          placeholder="Confirm Password"
        />
        <button
          className={`mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-green-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gradient-to-r from-green-600 to-green-400 text-white`}
          disabled={!(isValidPassword && isPasswordMatch)}
          onClick={handleFinalSignup}
        >
          Sign Up
        </button>
      </>
    )

  // Final signup handler
  const handleFinalSignup = async () => {
    setIsLoading(true);
    try {
      // Determine role based on account type and operation type
      let role: 'farmer' | 'fisherman' | 'buyer' = 'buyer';
      
      if (signupData.accountType === 'consumer') {
        role = 'buyer';
      } else if (signupData.accountType === 'seller') {
        if (signupData.operationType === 'farming') {
          role = 'farmer';
        } else if (signupData.operationType === 'fishing') {
          role = 'fisherman';
        } else if (signupData.operationType === 'both') {
          role = 'farmer'; // Default to farmer for mixed operations
        }
      }

      const payload = {
        name: signupData.fullName,
        role: role,
        email: signupData.email,
        password: signupData.password,
        phoneNumber: signupData.phoneNumber,
        location: {
          address: `${signupData.barangay}, ${signupData.municipality}, ${signupData.province}`,
          coordinates: { lat: 0, lng: 0 }, // Default coordinates
          region: signupData.region,
          province: signupData.province,
          city: signupData.municipality,
        },
        businessInfo: signupData.accountType === 'seller' ? {
          businessName: signupData.fullName,
          businessType: 'individual' as const,
          description: signupData.description,
        } : undefined,
        verificationStatus: signupData.accountType === 'seller' ? {
          isVerified: signupData.documentType === 'BIR',
          documents: signupData.documentType ? [{ type: signupData.documentType as any, url: '', uploadedAt: new Date().toISOString() }] : []
        } : undefined,
        membershipStatus: signupData.accountType === 'seller'
          ? (signupData.documentType === 'BIR'
              ? { tier: 'lifetime', documentType: 'BIR' }
              : signupData.documentType === 'BarangayClearance'
                ? { tier: 'temporary', documentType: 'BarangayClearance' }
                : { tier: 'none' })
          : { tier: 'none' }
      };

      const success = await signup(payload);
      if (success) {
        // If user uploaded a document, upload to Storage and update profile
        try {
          const currentUser = auth.currentUser;
          if (currentUser && signupData.documentFile && signupData.accountType === 'seller' && signupData.documentType) {
            const ext = (signupData.documentFile.name.split('.').pop() || 'bin').toLowerCase();
            const path = `users/${currentUser.uid}/documents/${Date.now()}_${signupData.documentType}.${ext}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, signupData.documentFile);
            const url = await getDownloadURL(storageRef);
            const userRef = doc(db, 'users', currentUser.uid);
            const isBir = signupData.documentType === 'BIR';
            await updateDoc(userRef, {
              'verificationStatus.documents': arrayUnion({ type: signupData.documentType, url, uploadedAt: new Date().toISOString() }),
              'verificationStatus.isVerified': isBir,
              membershipStatus: isBir ? { tier: 'lifetime', documentType: 'BIR' } : { tier: 'temporary', documentType: 'BarangayClearance' },
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error('Document upload failed:', e);
          // Non-fatal; user remains registered
        }
        const accountTypeText = signupData.accountType === 'consumer' ? 'consumer' : 'seller';
        toast({ 
          title: 'Registration Successful', 
          description: `Welcome to MarkIt! Your ${accountTypeText} account is ready.${signupData.documentFile ? ' Document saved.' : ''}` 
        });
        navigate('/');
      } else {
        toast({ title: 'Registration Failed', description: 'Please try again.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({ title: 'Registration Error', description: 'An error occurred during registration.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Splash screen with transition
  if (showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-2 h-2 rounded-full bg-green-400/30 dark:bg-white/20"
             style={{ left: `${(i * 9) % 100}%`, top: `${(i * 13) % 100}%` }}
              animate={{ y: [0, -12, 0], opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 3.5 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
            />
          ))}
        </div>
        {/* Rotating Blobs */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.08, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-green-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl"
        />
                  <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center relative z-10"
          >
            <img src="/markit-logo.svg" alt="MarkIt Logo" className="w-32 h-32 mb-4 animate-float" />
            <span className="text-green-900 dark:text-white text-4xl font-bold tracking-widest drop-shadow">MarkIt</span>
          </motion.div>
      </div>
    );
  }

  // Full-page onboarding for signup
  if (mode === 'signup') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setMode('login')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Join MarkIt
            </h1>
            <p className="text-muted-foreground">
              Complete your registration to start selling at guaranteed fair prices
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-3 ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2
                      ${isActive ? 'bg-green-600 text-white border-green-600' : 
                        isCompleted ? 'bg-green-500 text-white border-green-500' : 
                        'bg-background text-muted-foreground border-border'}
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="hidden md:block">
                      <p className={`text-sm font-medium ${isActive ? 'text-green-600' : isCompleted ? 'text-green-500' : 'text-muted-foreground'}`}>
                        Step {step.id}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.title}</p>
                    </div>
                  </div>
                  {index !== steps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${isCompleted ? 'bg-green-500' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-xl">
                {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={signupData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={signupData.phoneNumber}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        handleInputChange('phoneNumber', formatted);
                      }}
                      placeholder="+63 9XX XXX XXXX"
                      maxLength={17}
                    />
                    {signupData.phoneNumber && !isValidPhone && (
                      <p className="text-sm text-red-500">Please enter a valid Philippine mobile number</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region">Region *</Label>
                      <Select 
                        value={signupData.region} 
                        onValueChange={(value) => {
                          handleInputChange('region', value);
                          handleInputChange('province', ''); // Reset province when region changes
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(philippineRegions).map(([key, region]) => (
                            <SelectItem key={key} value={key}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <Select 
                        value={signupData.province} 
                        onValueChange={(value) => handleInputChange('province', value)}
                        disabled={!signupData.region}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableProvinces().map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="municipality">Municipality/City *</Label>
                      <Input
                        id="municipality"
                        value={signupData.municipality}
                        onChange={(e) => handleInputChange('municipality', e.target.value)}
                        placeholder="Enter municipality or city"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="barangay">Barangay *</Label>
                      <Input
                        id="barangay"
                        value={signupData.barangay}
                        onChange={(e) => handleInputChange('barangay', e.target.value)}
                        placeholder="Enter barangay"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Account Type *</Label>
                    <Select value={signupData.accountType} onValueChange={(value) => {
                      handleInputChange('accountType', value);
                      // Reset business fields when switching to consumer
                      if (value === 'consumer') {
                        handleInputChange('operationType', '');
                        handleInputChange('primaryProducts', '');
                        handleInputChange('yearsExperience', '');
                        handleInputChange('farmSize', '');
                        handleInputChange('description', '');
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consumer">Consumer</SelectItem>
                        <SelectItem value="seller">Producer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {signupData.accountType === 'seller' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="operationType">Type of Operation *</Label>
                        <Select value={signupData.operationType} onValueChange={(value) => handleInputChange('operationType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your operation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="farming">Farming (Rice, Corn, Vegetables, etc.)</SelectItem>
                            <SelectItem value="fishing">Fishing (Marine/Freshwater)</SelectItem>
                            <SelectItem value="both">Both Farming and Fishing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="primaryProducts">Primary Products *</Label>
                        <Input
                          id="primaryProducts"
                          value={signupData.primaryProducts}
                          onChange={(e) => handleInputChange('primaryProducts', e.target.value)}
                          placeholder="e.g., Rice, Corn, Bangus, Tilapia"
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="yearsExperience">Years of Experience</Label>
                          <Input
                            id="yearsExperience"
                            type="number"
                            min="0"
                            max="100"
                            value={signupData.yearsExperience}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
                                handleInputChange('yearsExperience', value);
                              }
                            }}
                            placeholder="5"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="farmSize">Farm/Operation Size</Label>
                          <Input
                            id="farmSize"
                            value={signupData.farmSize}
                            onChange={(e) => handleInputChange('farmSize', e.target.value)}
                            placeholder="e.g., 2 hectares, 5 fish ponds"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Brief Description</Label>
                        <Textarea
                          id="description"
                          value={signupData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Tell us about your farming/fishing operation..."
                          rows={3}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="documentType">Verification Document *</Label>
                          <Select value={signupData.documentType} onValueChange={(value) => handleInputChange('documentType', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BIR">BIR Certificate (lifetime membership)</SelectItem>
                              <SelectItem value="BarangayClearance">Barangay Clearance (temporary access)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="documentFile">Upload Document (optional)</Label>
                          <Input id="documentFile" type="file" accept="image/*,application/pdf" onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            setSignupData(prev => ({ ...prev, documentFile: file }));
                          }} />
                          <p className="text-xs text-muted-foreground">You can also upload later in your profile.</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {signupData.accountType === 'consumer' && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Consumer Account</h4>
                      <p className="text-green-700 text-sm">
                        As a consumer, you'll be able to browse and purchase fresh produce directly from local farmers and fisherfolk at guaranteed fair prices.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Create a secure password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        Almost Done!
                      </h3>
                      <p className="text-muted-foreground">
                        Create your password to complete your seller account registration.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep === 4 ? (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleFinalSignup}
                    disabled={!isValidPassword || !isPasswordMatch || isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Complete Registration'}
                  </Button>
                ) : (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && (!isValidFullName || !isValidPhone)) ||
                      (currentStep === 2 && (!isValidRegion || !isValidProvince || !isValidMunicipality || !isValidBarangay)) ||
                      (currentStep === 3 && (!isValidAccountType || (signupData.accountType === 'seller' && (!isValidOperationType || !isValidPrimaryProducts || !isValidSellerDocs))))
                    }
                  >
                    Next Step
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        toast({ title: 'Login Successful', description: 'Welcome back!' });
        const onboardingCompleted = localStorage.getItem('onboarding-completed');
        if (!onboardingCompleted) navigate('/onboarding');
        else navigate('/');
      } else {
        toast({ title: 'Login Failed', description: 'Invalid credentials. Please try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Login Error', description: 'An error occurred during login.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-2 h-2 rounded-full bg-green-400/30 dark:bg-white/20"
             style={{ left: `${(i * 11) % 100}%`, top: `${(i * 7) % 100}%` }}
            animate={{ y: [0, -10, 0], opacity: [0.35, 0.85, 0.35] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
          />
        ))}
      </div>
      {/* Rotating Blobs */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.06, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-56 -right-48 w-[28rem] h-[28rem] bg-green-300/20 dark:bg-slate-700/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-56 -left-48 w-[28rem] h-[28rem] bg-indigo-300/20 dark:bg-slate-800/30 rounded-full blur-3xl"
      />
      <div
        className={`absolute inset-0 flex items-center justify-center bg-green-200/50 dark:bg-slate-800/60 z-10 transition-all duration-500 ease-in-out ${splashTransition}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0.9, scale: 1.02 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="flex flex-col items-center"
        >
          <img src="/markit-logo.svg" alt="MarkIt Logo" className="w-32 h-32 mb-4 animate-float" />
          <span className="text-white text-4xl font-bold tracking-widest">MarkIt</span>
        </motion.div>
      </div>
      {/* Logo and EduHub text at the top */}
      <div className="flex flex-col items-center pt-16 pb-4 relative z-10 md:hidden">
        <img src="/markit-logo.svg" alt="MarkIt Logo" className="w-28 h-28 mb-3 animate-float" />
        <span className="text-green-700 dark:text-white text-5xl font-extrabold tracking-widest mb-1 drop-shadow">MarkIt</span>
        <span className="text-base text-green-600 dark:text-slate-200 font-medium text-center drop-shadow">Fair Prices for Farmers & Fisherfolk</span>
      </div>
      {/* Glassmorphism card for login/signup */}
      <div className={`flex-1 w-full transition-all duration-500 ease-in-out ${cardTransition}`}
        style={{ willChange: 'opacity, transform' }}>
        <div className="w-full">
          <div className="mx-auto w-full md:max-w-6xl md:grid md:grid-cols-[1fr_auto_1fr] md:gap-12 md:items-center md:py-16">
            <div className="md:col-span-1">
              <div className="hidden md:flex flex-col gap-6 pl-8 md:items-center md:text-center">
                <div className="flex items-center gap-3">
                  <img src="/markit-logo.svg" alt="MarkIt Logo" className="w-10 h-10" />
                  <span className="text-green-900 dark:text-white text-3xl lg:text-4xl font-extrabold tracking-wider">MarkIt</span>
                </div>
                <h2 className="text-5xl lg:text-6xl font-extrabold text-green-900 dark:text-white drop-shadow">Welcome back</h2>
                <p className="text-xl text-green-800/80 dark:text-slate-300 max-w-md">Sign in to connect with buyers, track your harvests, and secure fair prices.</p>
                <ul className="text-base text-green-900/80 dark:text-slate-300 space-y-2">
                  <li>• Fair price guarantees</li>
                  <li>• Direct buyer connections</li>
                  <li>• Harvest tracking and analytics</li>
                </ul>
              </div>
            </div>
            {/* Vertical Divider (desktop only) */}
            <div className="hidden md:block h-full w-px bg-green-200/60 dark:bg-slate-700/60 md:justify-self-center" aria-hidden="true" />
            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md md:ml-auto py-12 px-8 flex flex-col gap-10 relative z-10"
              >
              <div className="text-center mb-2">
                <span className="text-2xl md:text-3xl font-bold text-green-900 dark:text-white drop-shadow">{mode === 'login' ? 'Login in to your account' : 'Create your Account'}</span>
              </div>
              {mode === 'login' ? (
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                  <input
                    type="email"
                    placeholder="Email"
                    className="border rounded-full px-6 py-4 bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm text-xl font-medium"
                    value={loginData.email}
                    onChange={e => setLoginData({ ...loginData, email: e.target.value.trimStart() })}
                    required
                  />
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Password"
                      className="border rounded-full px-6 py-4 pr-14 bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm text-xl font-medium w-full"
                      value={loginData.password}
                      onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-transparent"
                      tabIndex={-1}
                      onClick={() => setShowLoginPassword(v => !v)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      <img src={showLoginPassword ? "/book-open-svgrepo-com.svg" : "/book-svgrepo-com.svg"} alt={showLoginPassword ? 'Hide password' : 'Show password'} className="w-7 h-7 opacity-80" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-lg py-2 mt-2 shadow-lg hover:from-green-700 hover:to-green-600 transition text-lg tracking-wide"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign in'}
                  </button>
                </form>
              ) : (
                <form className="flex flex-col gap-4" onSubmit={handleFinalSignup}>
                  <input
                    type="email"
                    placeholder="Email"
                    className="border rounded-full px-6 py-4 bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm text-xl font-medium"
                    value={signupData.email}
                    onChange={e => setSignupData({ ...signupData, email: e.target.value.trimStart() })}
                    required
                  />
                  <div className="relative">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Password"
                      className="border rounded-full px-6 py-4 pr-14 bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm text-xl font-medium w-full"
                       value={signupData.password}
                      onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-transparent"
                      tabIndex={-1}
                      onClick={() => setShowSignupPassword(v => !v)}
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      <img src={showSignupPassword ? "/book-open-svgrepo-com.svg" : "/book-svgrepo-com.svg"} alt={showSignupPassword ? 'Hide password' : 'Show password'} className="w-7 h-7 opacity-80" />
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSignupConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="border rounded-full px-6 py-4 pr-14 bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm text-xl font-medium w-full"
                       value={signupData.confirmPassword}
                      onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-transparent"
                      tabIndex={-1}
                      onClick={() => setShowSignupConfirmPassword(v => !v)}
                      aria-label={showSignupConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <img src={showSignupConfirmPassword ? "/book-open-svgrepo-com.svg" : "/book-svgrepo-com.svg"} alt={showSignupConfirmPassword ? 'Hide password' : 'Show password'} className="w-7 h-7 opacity-80" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold rounded-lg py-2 mt-2 shadow-lg hover:from-green-700 hover:to-green-500 transition text-lg tracking-wide"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing Up...' : 'Sign up'}
                  </button>
                </form>
              )}
              {/* Terms of Agreement Notice */}
              <div className="text-center text-xs text-slate-600 dark:text-slate-300 my-2">
                By signing in or creating an account, you agree to our
                <a href="/terms" className="text-green-600 dark:text-green-400 hover:underline mx-1" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                and
                <a href="/privacy" className="text-green-600 dark:text-green-400 hover:underline mx-1" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </div>
              <div className="text-center text-base text-slate-700 dark:text-slate-200 mt-4">
                {mode === 'login' ? (
                  <>Don&apos;t have an account?{' '}
                    <span
                      className="ml-2 text-green-700 dark:text-green-400 font-bold underline cursor-pointer hover:opacity-80 transition"
                      onClick={() => setMode('signup')}
                      role="button"
                      tabIndex={0}
                    >
                      Sign up
                    </span>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <span
                      className="ml-2 text-green-700 dark:text-green-400 font-bold underline cursor-pointer hover:opacity-80 transition"
                      onClick={() => setMode('login')}
                      role="button"
                      tabIndex={0}
                    >
                      Sign in
                    </span>
                  </>
                )}
              </div>
              </motion.div>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
