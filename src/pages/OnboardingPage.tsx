
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, Shield, BarChart3, List, Award, BookOpen, Users, Calculator, FileText, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const slides: OnboardingSlide[] = [
    {
      id: "welcome",
      title: "Welcome to EducHub",
      subtitle: "Your Academic Management Companion",
      description: "Transform how you manage grades, track student progress, and maintain academic records with our intuitive platform designed specifically for educators.",
      icon: <Sparkles className="w-16 h-16" />,
      color: "from-blue-500 to-purple-600",
      gradient: "bg-gradient-to-br from-blue-500 to-purple-600"
    },
    {
      id: "grades",
      title: "Smart Grade Management",
      subtitle: "Calculate with Confidence",
      description: "Automated grade calculations using official DepEd standards. Track written work, performance tasks, and quarterly exams with precision and ease.",
      icon: <Calculator className="w-16 h-16" />,
      color: "from-green-500 to-emerald-600",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-600"
    },
    {
      id: "records",
      title: "Comprehensive Records",
      subtitle: "Everything in One Place",
      description: "Centralized student information, attendance tracking, and progress monitoring. Access complete academic histories instantly from anywhere.",
      icon: <FileText className="w-16 h-16" />,
      color: "from-orange-500 to-red-500",
      gradient: "bg-gradient-to-br from-orange-500 to-red-500"
    },
    {
      id: "subjects",
      title: "Subject Management",
      subtitle: "Organize Your Curriculum",
      description: "Configure subjects with proper tracks and types. Ensure accurate grade calculations using the right DepEd formulas and weightings.",
      icon: <BookOpen className="w-16 h-16" />,
      color: "from-purple-500 to-pink-600",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600"
    },
    {
      id: "students",
      title: "Student Connections",
      subtitle: "Bridge the Gap",
      description: "Enable students to connect and view their grades securely. Foster transparency while maintaining academic integrity.",
      icon: <Users className="w-16 h-16" />,
      color: "from-indigo-500 to-blue-600",
      gradient: "bg-gradient-to-br from-indigo-500 to-blue-600"
    },
    {
      id: "success",
      title: "Ready to Begin?",
      subtitle: "Start Your Journey",
      description: "Join thousands of educators who trust EducHub for their academic management needs. Let's make education more efficient together.",
      icon: <CheckCircle className="w-16 h-16" />,
      color: "from-teal-500 to-green-600",
      gradient: "bg-gradient-to-br from-teal-500 to-green-600"
    }
  ];

  const nextSlide = () => {
    setDirection(1);
    if (currentSlide === slides.length - 1) {
      handleComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide(prev => prev > 0 ? prev - 1 : 0);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setShowConfetti(true);
    setTimeout(() => navigate('/'), 1200);
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true');
    navigate('/');
  };

  const currentSlideData = slides[currentSlide];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      nextSlide();
    } else if (swipe > swipeConfidenceThreshold) {
      prevSlide();
    }
  };

  // Auto-play with pause on hover
  useEffect(() => {
    const shouldAutoplay = !isHovering;
    if (!shouldAutoplay) return;
    const id = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev === slides.length - 1) {
          handleComplete();
          return prev;
        }
        setDirection(1);
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [isHovering, slides.length]);

  const progressPct = Math.round(((currentSlide + 1) / slides.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-slate-800">EducHub</span>
          </div>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-full px-4 py-2"
          >
            Skip
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="absolute top-24 left-6 right-6 z-20">
        <div className="bg-white/30 backdrop-blur-sm rounded-full h-2 overflow-hidden relative">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          <div className="absolute -top-6 right-0 text-xs font-semibold text-slate-600">{progressPct}%</div>
        </div>
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/50"
            style={{ left: `${(i * 7) % 100}%`, top: `${(i * 13) % 100}%` }}
            animate={{ y: [0, -10, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div
        className="relative h-screen flex items-center justify-center px-6 pt-32 pb-20"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="w-full max-w-4xl"
          >
            <div className="text-center">
              {/* Icon Container with float animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className={`w-32 h-32 mx-auto mb-8 rounded-3xl ${currentSlideData.gradient} shadow-2xl flex items-center justify-center text-white`}
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
                  {currentSlideData.icon}
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4"
              >
                {currentSlideData.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className={`text-xl md:text-2xl font-semibold mb-6 bg-gradient-to-r ${currentSlideData.color} bg-clip-text text-transparent`}
              >
                {currentSlideData.subtitle}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12"
              >
                {currentSlideData.description}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                {currentSlide > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={prevSlide}
                    className="px-8 py-3 rounded-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                  </Button>
                )}

                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <Button
                    size="lg"
                    onClick={nextSlide}
                    className={`px-8 py-3 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 ${currentSlideData.gradient}`}
                  >
                    {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                    {currentSlide !== slides.length - 1 && <ChevronRight className="w-5 h-5 ml-2" />}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl"
        />
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-2 h-3 rounded-sm"
                style={{ left: `${(i * 17) % 100}%`, top: '-10px', backgroundColor: ['#ef4444','#22c55e','#3b82f6','#eab308','#ec4899'][i%5] }}
                animate={{ y: [ -10, 800 ], rotate: [0, 360] }}
                transition={{ duration: 1.2 + (i % 5) * 0.05, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
