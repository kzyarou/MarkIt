import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useBottomNav } from '@/hooks/use-mobile';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();
  const { bottomNavClass } = useBottomNav();
  return (
    <div className={`min-h-screen bg-background px-4 ${bottomNavClass}`}>
      <div className="pt-6 pb-2 max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">Terms and Conditions</h1>
        </div>
        <div className="space-y-6 text-base max-w-2xl mx-auto">
          <p>Welcome to <b>MarkIt</b>. By using this app, you agree to the following terms and conditions. Please read them carefully.</p>
          <h2 className="text-lg font-bold mt-4">1. Acceptance of Terms</h2>
          <p>By accessing or using MarkIt, you agree to be bound by these terms. If you do not agree, please do not use the app.</p>
          <h2 className="text-lg font-bold mt-4">2. Use of the App</h2>
          <ul className="list-disc ml-6">
            <li>You must use the app in compliance with all applicable laws and DepEd regulations.</li>
            <li>You are responsible for maintaining the confidentiality of your account and data.</li>
            <li>You may not use the app for any unlawful or unauthorized purpose.</li>
          </ul>
          <h2 className="text-lg font-bold mt-4">3. Intellectual Property</h2>
          <ul className="list-disc ml-6">
            <li>All content, trademarks, and code in MarkIt are the property of their respective owners.</li>
            <li>You may not copy, modify, or distribute any part of the app without permission.</li>
          </ul>
          <h2 className="text-lg font-bold mt-4">4. Limitation of Liability</h2>
          <ul className="list-disc ml-6">
            <li>MarkIt is provided "as is" without warranties of any kind.</li>
            <li>We are not liable for any damages or losses resulting from your use of the app.</li>
            <li>We do not guarantee the accuracy or completeness of academic calculations; always verify with official DepEd sources.</li>
          </ul>
          <h2 className="text-lg font-bold mt-4">5. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the app means you accept any changes.</p>
          <h2 className="text-lg font-bold mt-4">6. Contact</h2>
          <p>If you have questions about these terms, contact us at <a href="mailto:support@educhub.app" className="text-blue-600 underline">support@educhub.app</a>.</p>
        </div>
      </div>
    </div>
  );
} 