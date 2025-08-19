import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Remove the old steps object and branching logic
// const steps = {
//   name: 0,
//   role: 1,
//   studentDetails: 2,
//   studentEmail: 3,
//   studentPassword: 4,
//   teacherEmpId: 2,
//   teacherAge: 3,
//   teacherEmail: 4,
//   teacherPassword: 5,
// };

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
  const [signupStep, setSignupStep] = useState(0);
  const [signupData, setSignupData] = useState({
    name: '',
    role: '',
    lrn: '',
    empId: '',
    age: '',
    gradeLevel: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '', // <-- Added gender
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

  // Validation helpers
  const isValidName = signupData.name.trim().length > 1;
  const isValidRole = signupData.role === 'student' || signupData.role === 'teacher';
  const isValidLrn = /^[0-9]{12}$/.test(signupData.lrn);
  const isValidEmpId = signupData.empId.trim().length > 0;
  const isValidAge = Number(signupData.age) > 4 && Number(signupData.age) < 100;
  const isValidGradeLevel = /^[7-9]$|^10$|^11$|^12$/.test(signupData.gradeLevel);
  const isValidEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signupData.email.trim());
  const isValidPassword = signupData.password.length >= 6;
  const isPasswordMatch = signupData.password === signupData.confirmPassword;
  const isValidGender = signupData.gender === 'male' || signupData.gender === 'female';

  // Progress calculation for completed/valid steps only
  const getCompletedSteps = () => {
    let completed = 0;
    if (isValidName) completed++;
    if (isValidRole) completed++;
    if (isValidGender) completed++;
    if (signupData.role === 'student') {
      if (isValidLrn) completed++;
      if (isValidAge) completed++;
      if (isValidGradeLevel) completed++;
      if (isValidEmail) completed++;
      if (isValidPassword && isPasswordMatch) completed++;
      return completed;
    } else if (signupData.role === 'teacher') {
      if (isValidEmpId) completed++;
      if (isValidAge) completed++;
      if (isValidEmail) completed++;
      if (isValidPassword && isPasswordMatch) completed++;
      return completed;
    }
    return completed;
  };
  const totalSteps = signupData.role === 'teacher' ? 7 : 8; // <-- Increased by 1 for gender
  const progress = Math.min(getCompletedSteps() / totalSteps, 1);

  // Onboarding step renderers
  const signupSteps = [
    // Name step
    ({ signupData, setSignupData, progress, isValidName, setSignupStep }) => (
      <>
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-blue-900">Let's create your profile</div>
        <label className="block mb-2 text-blue-900 text-base sm:text-lg">What's your name?</label>
        <input
          type="text"
          className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
          value={signupData.name}
          onChange={e => setSignupData({ ...signupData, name: e.target.value })}
          placeholder="Full Name"
          autoFocus
        />
        <button
          className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-blue-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
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
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-blue-900">Let's create your profile</div>
        <div className="text-2xl font-bold mb-6 text-blue-900">What's your role?</div>
        <div className="flex flex-col gap-3 mb-6">
          <button
            className={`border rounded-full px-4 py-3 text-left font-semibold transition shadow-sm ${signupData.role === 'student' ? 'bg-[#e7fbe7] border-[#4ade80] text-black' : 'bg-white text-black'} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500`}
            onClick={() => setSignupData({ ...signupData, role: 'student' })}
            type="button"
          >Student</button>
          <button
            className={`border rounded-full px-4 py-3 text-left font-semibold transition shadow-sm ${signupData.role === 'teacher' ? 'bg-[#e7fbe7] border-[#4ade80] text-black' : 'bg-white text-black'} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500`}
            onClick={() => setSignupData({ ...signupData, role: 'teacher' })}
            type="button"
          >Teacher</button>
        </div>
        <button
          className="w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-blue-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
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
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-blue-900">Let's create your profile</div>
        <div className="text-2xl font-bold mb-6 text-blue-900">What's your gender?</div>
        <div className="flex flex-col gap-3 mb-6">
          <button
            className={`border rounded-full px-4 py-3 text-left font-semibold transition shadow-sm ${signupData.gender === 'male' ? 'bg-[#e7fbe7] border-[#4ade80] text-black' : 'bg-white text-black'} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500`}
            onClick={() => setSignupData({ ...signupData, gender: 'male' })}
            type="button"
          >Male</button>
          <button
            className={`border rounded-full px-4 py-3 text-left font-semibold transition shadow-sm ${signupData.gender === 'female' ? 'bg-[#e7fbe7] border-[#4ade80] text-black' : 'bg-white text-black'} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500`}
            onClick={() => setSignupData({ ...signupData, gender: 'female' })}
            type="button"
          >Female</button>
        </div>
        <button
          className="w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-blue-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
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
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-blue-900">Let's create your profile</div>
        {signupData.role === 'student' ? (
          <>
            <label className="block mb-2 text-blue-900 dark:text-white">What’s your LRN? (12 digits)</label>
            <input
              type="text"
              className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
              value={signupData.lrn}
              onChange={e => setSignupData({ ...signupData, lrn: e.target.value.replace(/[^0-9]/g, '').slice(0,12) })}
              placeholder="Learner Reference Number"
              maxLength={12}
            />
            <button
              className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-blue-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
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
            <label className="block mb-2 text-blue-900 dark:text-white">What's your DepEd Employee Number?</label>
            <input
              type="text"
              className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
              value={signupData.empId}
              onChange={e => setSignupData({ ...signupData, empId: e.target.value })}
              placeholder="DepEd Employee Number"
            />
            <button
              className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-blue-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
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
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-blue-900">Let's create your profile</div>
        <label className="block mb-2 text-blue-900 dark:text-white">How old are you?</label>
        <input
          type="number"
          className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
          value={signupData.age}
          onChange={e => setSignupData({ ...signupData, age: e.target.value.replace(/[^0-9]/g, '') })}
          placeholder="Age"
          min={signupData.role === 'teacher' ? 18 : 5}
          max={99}
        />
        <button
          className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-blue-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
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
          <div className="text-3xl sm:text-4xl font-bold mb-10 text-blue-900">Let's create your profile</div>
          <label className="block mb-2 text-blue-900 dark:text-white">What grade are you in? (7-12)</label>
          <input
            type="number"
            min={7}
            max={12}
            className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
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
            className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-blue-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
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
        <div className="text-3xl sm:text-4xl font-bold mb-10 text-blue-900">Let's create your profile</div>
        <label className="block mb-2 text-blue-900 dark:text-white">What's your email?</label>
        <input
          type="email"
          className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
          value={signupData.email}
          onChange={e => setSignupData({ ...signupData, email: e.target.value.trimStart() })}
          placeholder="Email"
        />
        <button
          className="mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-blue-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
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
        <div className="text-2xl font-bold mb-6 text-blue-900 dark:text-white">Set a Password</div>
        <label className="block mb-2 text-blue-900 dark:text-white">Set a password</label>
        <input
          type="password"
          className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
          value={signupData.password}
          onChange={e => setSignupData({ ...signupData, password: e.target.value })}
          placeholder="Password (min 6 chars)"
        />
        <label className="block mt-4 mb-2 text-blue-900 dark:text-white">Confirm your password</label>
        <input
          type="password"
          className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm bg-white text-black placeholder:text-gray-400 text-xl font-medium"
          value={signupData.confirmPassword}
          onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })}
          placeholder="Confirm Password"
        />
        <button
          className={`mt-8 w-full py-2 rounded-full font-semibold transition relative overflow-hidden text-xl border-2 border-blue-500 shadow-lg hover:shadow-xl active:shadow-md active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-600 to-blue-400 text-white`}
          disabled={!(isValidPassword && isPasswordMatch)}
          onClick={handleFinalSignup}
        >
          Sign Up
        </button>
      </>
    ),
  ];

  // Replace renderSignupStep with:
  const renderSignupStep = () => {
    const stepProps = {
      signupData,
      setSignupData,
      progress,
      isValidName,
      isValidRole,
      isValidGender, // <-- Added
      isValidLrn,
      isValidEmpId,
      isValidAge,
      isValidGradeLevel, // <-- Changed
      isValidEmail,
      isValidPassword,
      isPasswordMatch,
      setSignupStep,
      handleFinalSignup,
    };
    // For student, skip grade level step if not student
    if (signupStep === 5 && signupData.role !== 'student') { // <-- index +1
      setSignupStep(6);
      return null;
    }
    // Only render steps that exist
    if (signupStep < signupSteps.length) {
      return signupSteps[signupStep](stepProps);
    }
    return null;
  };

  // Final signup handler
  const handleFinalSignup = async () => {
    setIsLoading(true);
    try {
      const payload = signupData.role === 'student'
        ? {
            name: signupData.name,
            role: 'student' as 'student',
            lrn: signupData.lrn,
            email: signupData.email,
            password: signupData.password,
            avatarUrl: undefined,
            bio: undefined,
            gender: signupData.gender as 'male' | 'female', // <-- Type assertion
            age: signupData.age ? Number(signupData.age) : undefined,
            gradeLevel: signupData.gradeLevel ? `Grade ${signupData.gradeLevel}` : undefined,
          }
        : {
            name: signupData.name,
            role: 'teacher' as 'teacher',
            lrn: undefined,
            email: signupData.email,
            password: signupData.password,
            avatarUrl: undefined,
            bio: undefined,
            gender: signupData.gender as 'male' | 'female', // <-- Type assertion
            employeeNumber: signupData.empId,
            age: signupData.age ? Number(signupData.age) : undefined,
          };
      const success = await signup(payload);
      if (success) {
        toast({ title: 'Account Created', description: 'Welcome!' });
          navigate('/onboarding');
      } else {
        toast({ title: 'Signup Failed', description: 'Failed to create account. Please try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Signup Error', description: 'An error occurred during signup.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Splash screen with transition
  if (showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-2 h-2 rounded-full bg-blue-400/30 dark:bg-white/20"
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
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"
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
            <img src="/graduation-cap-svgrepo-com.svg" alt="Logo" className="w-32 h-32 mb-4 animate-float filter invert brightness-200" />
            <span className="text-blue-900 dark:text-white text-4xl font-bold tracking-widest drop-shadow">EducHub</span>
          </motion.div>
      </div>
    );
  }

  // Full-page onboarding for signup
  if (mode === 'signup') {
    return (
      <div className="min-h-screen flex flex-col bg-[#2563eb]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <button
            className="text-[#2336a7] font-semibold text-base"
            onClick={() => setSignupStep(Math.max(0, signupStep - 1))}
            disabled={signupStep === 0}
          >
            {signupStep > 0 ? 'Back' : ''}
          </button>
          <div className="w-7 h-7" />
        </div>
        {/* Step content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="bg-white/60 rounded-[2.5rem] shadow-2xl py-12 px-8 flex flex-col gap-10 border border-white/30">
              <img src="/graduation-cap-svgrepo-com.svg" alt="Logo" className="w-8 h-8 mb-4 ml-1 filter invert brightness-200" style={{alignSelf:'flex-start'}} />
              {renderSignupStep()}
            </div>
          </div>
        </div>
        {/* Bottom branding */}
        <div className="flex flex-col items-center pb-6">
          <img src="/graduation-cap-svgrepo-com.svg" alt="Logo" className="w-6 h-6 mb-1 filter invert brightness-200" />
          <span className="text-white font-semibold text-lg drop-shadow">EducHub</span>
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-2 h-2 rounded-full bg-blue-400/30 dark:bg-white/20"
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
        className="absolute -top-56 -right-48 w-[28rem] h-[28rem] bg-blue-300/20 dark:bg-slate-700/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-56 -left-48 w-[28rem] h-[28rem] bg-indigo-300/20 dark:bg-slate-800/30 rounded-full blur-3xl"
      />
      <div
        className={`absolute inset-0 flex items-center justify-center bg-blue-200/50 dark:bg-slate-800/60 z-10 transition-all duration-500 ease-in-out ${splashTransition}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0.9, scale: 1.02 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="flex flex-col items-center"
        >
          <img src="/graduation-cap-svgrepo-com.svg" alt="Logo" className="w-32 h-32 mb-4 animate-float filter invert brightness-200" />
          <span className="text-white text-4xl font-bold tracking-widest">EducHub</span>
        </motion.div>
      </div>
      {/* Logo and EduHub text at the top */}
      <div className="flex flex-col items-center pt-16 pb-4 relative z-10">
        <img src="/graduation-cap-svgrepo-com.svg" alt="Logo" className="w-28 h-28 mb-3 animate-float filter invert brightness-200" />
        <span className="text-blue-700 dark:text-white text-5xl font-extrabold tracking-widest mb-1 drop-shadow">EducHub</span>
        <span className="text-base text-blue-600 dark:text-slate-200 font-medium text-center drop-shadow">Smart Tools for Smarter Schools</span>
      </div>
      {/* Glassmorphism card for login/signup */}
      <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${cardTransition}`}
        style={{ willChange: 'opacity, transform' }}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md py-12 px-8 flex flex-col gap-10 relative z-10 -mt-4"
        >
                      <div className="text-center mb-2">
              <span className="text-2xl font-bold text-blue-900 dark:text-white drop-shadow">{mode === 'login' ? 'Login in to your account' : 'Create your Account'}</span>
            </div>
          {mode === 'login' ? (
            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                className="border rounded-full px-6 py-4 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm text-xl font-medium"
                value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value.trimStart() })}
                required
              />
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  className="border rounded-full px-6 py-4 pr-14 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm text-xl font-medium w-full"
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg py-2 mt-2 shadow-lg hover:from-blue-700 hover:to-blue-600 transition text-lg tracking-wide"
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
                className="border rounded-full px-6 py-4 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm text-xl font-medium"
                value={signupData.email}
                onChange={e => setSignupData({ ...signupData, email: e.target.value.trimStart() })}
                required
              />
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Password"
                  className="border rounded-full px-6 py-4 pr-14 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm text-xl font-medium w-full"
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
                  className="border rounded-full px-6 py-4 pr-14 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition shadow-sm text-xl font-medium w-full"
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-lg py-2 mt-2 shadow-lg hover:from-blue-700 hover:to-blue-500 transition text-lg tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? 'Signing Up...' : 'Sign up'}
              </button>
            </form>
          )}
          {/* Terms of Agreement Notice */}
          <div className="text-center text-xs text-slate-600 dark:text-slate-300 my-2">
            By signing in or creating an account, you agree to our
            <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline mx-1" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            and
            <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline mx-1" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </div>
          <div className="text-center text-base text-slate-700 dark:text-slate-200 mt-4">
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <span
                  className="ml-2 text-blue-700 dark:text-blue-400 font-bold underline cursor-pointer hover:opacity-80 transition"
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
                  className="ml-2 text-blue-700 dark:text-blue-400 font-bold underline cursor-pointer hover:opacity-80 transition"
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
  );
}
