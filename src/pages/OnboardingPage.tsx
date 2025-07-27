
import React from 'react';
import { OnboardingCarousel, DefaultIllustrations } from '@/components/OnboardingCarousel';
import { OnboardingSlide } from '@/types/grading';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const slides: OnboardingSlide[] = [
    {
      id: "welcome",
      title: "Welcome to Educhub!",
      subtitle: "Your all-in-one platform for managing student grades, attendance, and academic records with ease.",
      illustration: <DefaultIllustrations.Welcome />
    },
    {
      id: "grades",
      title: "Effortless Grade Management",
      subtitle: "Easily calculate, record, and review grades using official standards. Stay organized and accurate every step of the way.",
      illustration: <DefaultIllustrations.Grades />
    },
    {
      id: "records",
      title: "Comprehensive Academic Records",
      subtitle: "Keep track of student progress, attendance, and notes all in one secure place. Access records anytime, anywhere.",
      illustration: <DefaultIllustrations.Records />
    },
    {
      id: "books",
      title: "Resources at Your Fingertips",
      subtitle: "Access digital books, materials, and references to support teaching and learning inside the platform.",
      illustration: <DefaultIllustrations.Books />
    },
    {
      id: "success",
      title: "Ready to Get Started?",
      subtitle: "Begin your journey with Educhub and empower your academic management today!",
      illustration: <DefaultIllustrations.Success />
    },
    {
      id: "track-type",
      title: "Subject Track/Type",
      subtitle: "When adding a subject, you must now specify its <b>track</b> (for Senior High School: Core, Academic, TVL, Sports/Arts) or <b>type</b> (for JHS/Elementary: Languages, AP, EsP, Science, Math, MAPEH, EPP/TLE). This ensures the correct DepEd formula and weights are used for grade calculation and reporting.",
      illustration: <DefaultIllustrations.TrackType />
    }
  ];

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    navigate('/');
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true');
    navigate('/');
  };

  return (
    <OnboardingCarousel
      slides={slides}
      onComplete={handleComplete}
      onSkip={handleSkip}
      showSkipButton={true}
      showProgressDots={true}
      autoPlay={false}
    />
  );
}
