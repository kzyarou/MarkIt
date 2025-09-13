import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useBottomNav } from '@/hooks/use-mobile';
import { ShieldCheck } from 'lucide-react';

export default function DataPrivacyPage() {
  const navigate = useNavigate();
  const { bottomNavClass } = useBottomNav();
  return (
    <div className={`min-h-screen bg-background px-4 ${bottomNavClass}`}>
      <div className="pt-6 pb-2 max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">Data Privacy Terms</h1>
        </div>
        <div className="space-y-6 text-base max-w-2xl mx-auto">
          <p><b>MarkIt</b> values your privacy and is committed to protecting your personal data. This page explains what data we collect, how it is used, and your rights as a user.</p>
          <h2 className="text-lg font-bold mt-4">1. What Data We Collect</h2>
          <ul className="list-disc ml-6">
            <li><b>Account Information:</b> Name, email address, and profile details.</li>
            <li><b>Academic Data:</b> Grades, attendance, subjects, and related records you enter or manage in the app.</li>
            <li><b>Usage Data:</b> Device information, app usage statistics, and error logs (for improving the app).</li>
          </ul>
          <h2 className="text-lg font-bold mt-4">2. How We Use Your Data</h2>
          <ul className="list-disc ml-6">
            <li>To provide and improve the app's features and services.</li>
            <li>To personalize your experience and save your preferences.</li>
            <li>To ensure compliance with DepEd and educational standards.</li>
            <li>To communicate important updates or support information.</li>
          </ul>
          <h2 className="text-lg font-bold mt-4">3. Data Sharing and Security</h2>
          <ul className="list-disc ml-6">
            <li>We do <b>not</b> sell or share your personal data with third parties, except as required by law or with your explicit consent.</li>
            <li>All data is stored securely and access is restricted to authorized users only.</li>
          </ul>
          <h2 className="text-lg font-bold mt-4">4. Your Rights</h2>
          <ul className="list-disc ml-6">
            <li>You may access, update, or delete your personal data at any time via your account settings.</li>
            <li>You may request a copy of your data or ask for corrections by contacting support.</li>
            <li>You may withdraw consent for data processing (note: this may affect app functionality).</li>
          </ul>
          <h2 className="text-lg font-bold mt-4">5. Contact Us</h2>
          <p>If you have questions or concerns about your data privacy, please contact us at <a href="mailto:support@educhub.app" className="text-blue-600 underline">support@educhub.app</a>.</p>
        </div>
      </div>
    </div>
  );
} 