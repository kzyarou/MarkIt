
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, Shield, BarChart3, List, Award } from 'lucide-react';
import { OnboardingSlide } from '@/types/grading';
import MarkItLogo from '@/public/markit-logo.svg';
import Book from '@/public/book-svgrepo-com.svg';
import BookOpen from '@/public/book-open-svgrepo-com.svg';
import CheckExam from '@/public/check-education-exam-svgrepo-com.svg';
import NotesPen from '@/public/notes-outlined-pen-and-paper-svgrepo-com.svg';

interface OnboardingCarouselProps {
  slides: OnboardingSlide[];
  onComplete: () => void;
  onSkip?: () => void;
  className?: string;
  showSkipButton?: boolean;
  showProgressDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const DefaultIllustrations = {
  Welcome: () => (
    <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100 border-4 border-green-300 shadow-lg">
      <img src="/markit-logo.svg" alt="MarkIt Logo" className="w-20 h-20" />
    </div>
  ),
  Grades: () => (
    <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100 border-4 border-green-300 shadow-lg">
      <img src="/check-education-exam-svgrepo-com.svg" alt="Exam Check" className="w-20 h-20" />
    </div>
  ),
  Records: () => (
    <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100 border-4 border-green-300 shadow-lg">
      <img src="/notes-outlined-pen-and-paper-svgrepo-com.svg" alt="Notes and Pen" className="w-20 h-20" />
    </div>
  ),
  Books: () => (
    <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100 border-4 border-green-300 shadow-lg">
      <img src="/book-open-svgrepo-com.svg" alt="Open Book" className="w-20 h-20" />
    </div>
  ),
  Success: () => (
    <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100 border-4 border-green-300 shadow-lg">
      <img src="/book-svgrepo-com.svg" alt="Book" className="w-20 h-20" />
    </div>
  ),
  TrackType: () => (
    <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100 border-4 border-green-300 shadow-lg">
      <img src="/book-open-svgrepo-com.svg" alt="Track/Type" className="w-20 h-20" />
    </div>
  ),
};

export function OnboardingCarousel({
  slides,
  onComplete,
  onSkip,
  className = "",
  showSkipButton = true,
  showProgressDots = true,
  autoPlay = false,
  autoPlayInterval = 3000
}: OnboardingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => 
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slides.length]);

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    setCurrentSlide(prev => prev > 0 ? prev - 1 : 0);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200 p-4">
      <div className="max-w-md w-full rounded-3xl shadow-2xl p-0 text-center relative bg-white border-2 border-green-200">
        {/* Skip Button */}
        {showSkipButton && onSkip && (
          <button
            onClick={onSkip}
            className="absolute top-4 left-6 text-green-400 hover:text-green-600 text-base font-medium z-10 bg-white bg-opacity-80 px-3 py-1 rounded-full shadow"
          >
            Skip
          </button>
        )}
        {/* Slide Content */}
        <div className="flex flex-col items-center justify-center px-8 pt-12 pb-8">
          {currentSlideData.illustration}
          <h2 className="text-2xl font-bold text-green-900 mb-3 mt-2">
            {currentSlideData.title}
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-2">
            {currentSlideData.subtitle}
          </p>
        </div>
        {/* Progress Dots */}
        {showProgressDots && (
          <div className="flex justify-center space-x-2 mb-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-8 h-2 rounded-full transition-colors duration-200 focus:outline-none ${
                  index === currentSlide
                    ? 'bg-green-600' : 'bg-green-200'
                }`}
              />
            ))}
          </div>
        )}
        {/* Navigation */}
        <div className="flex justify-between items-center px-8 pb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 rounded-full px-6 py-2 border-green-300 text-green-600"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={nextSlide}
            className="flex items-center gap-2 rounded-full px-8 py-2 bg-green-600 text-white shadow-lg hover:bg-green-700"
          >
            {currentSlide === slides.length - 1 ? 'Finish' : 'Next'}
            {currentSlide !== slides.length - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
