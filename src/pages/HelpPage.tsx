import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useBottomNav } from '@/hooks/use-mobile';
import { HelpCircle, MessageCircle, Mail, Phone, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HelpPage() {
  const navigate = useNavigate();
  const { bottomNavClass } = useBottomNav();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqData = [
    {
      question: "How do I create a harvest listing?",
      answer: "To create a harvest listing, go to the 'Create Harvest' section from your dashboard. Fill in the required information including crop type, quantity, price, and location. Add photos of your harvest and set your preferred contact method. Once submitted, your listing will be visible to buyers in the marketplace."
    },
    {
      question: "How does the price guarantee work?",
      answer: "MarkIt's price guarantee ensures fair pricing for farmers and fishermen. We provide market-based pricing recommendations and protect against price manipulation. If you encounter unfair pricing practices, report them through our feedback system."
    },
    {
      question: "How do I contact buyers or sellers?",
      answer: "Use the built-in messaging system to communicate with other users. Click on any user's profile or harvest listing to start a conversation. All messages are encrypted and secure."
    },
    {
      question: "What payment methods are accepted?",
      answer: "MarkIt supports various payment methods including cash on delivery, bank transfers, and digital payments. Payment terms are negotiated directly between buyers and sellers through our messaging system."
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to your Profile section and click 'Edit Profile'. You can update your personal information, business details, location, and contact preferences. Make sure to keep your information current for better visibility."
    },
    {
      question: "Is my data secure on MarkIt?",
      answer: "Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent. Read our Privacy Policy for more details."
    },
    {
      question: "How do I report a problem or suspicious activity?",
      answer: "Use the 'Leave Feedback' option in Settings to report any issues. For urgent matters, contact our support team directly. We investigate all reports promptly and take appropriate action."
    },
    {
      question: "Can I use MarkIt on multiple devices?",
      answer: "Yes, you can access MarkIt from any device with internet connection. Your data syncs across all devices automatically. Simply log in with your credentials on any device."
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className={`min-h-screen bg-background px-4 ${bottomNavClass}`}>
      <div className="pt-6 pb-2 max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight">Help & Support</h1>
        </div>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">kzyaroudev@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+63 946 499 2055</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Office Address</p>
                  <p className="text-sm text-muted-foreground">Barangay 2, Dolores, Eastern Samar, Philippines</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Support Hours</p>
                  <p className="text-sm text-muted-foreground">Sat: 1:00PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto p-4 justify-start"
                onClick={() => navigate('/settings')}
              >
                <div className="text-left">
                  <p className="font-medium">Leave Feedback</p>
                  <p className="text-sm text-muted-foreground">Share your thoughts and suggestions</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 justify-start"
                onClick={() => navigate('/privacy-policy')}
              >
                <div className="text-left">
                  <p className="font-medium">Privacy Policy</p>
                  <p className="text-sm text-muted-foreground">Learn how we protect your data</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {faqData.map((faq, index) => (
                <div key={index} className="border rounded-lg">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-muted transition-colors"
                  >
                    <span className="font-medium">{faq.question}</span>
                    {expandedFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-4 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium">Complete Your Profile</h4>
                  <p className="text-sm text-muted-foreground">Add your business information, location, and contact details to build trust with other users.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium">Browse the Marketplace</h4>
                  <p className="text-sm text-muted-foreground">Explore available harvests or search for specific products using our search filters.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium">Create or Respond to Listings</h4>
                  <p className="text-sm text-muted-foreground">List your harvests or contact sellers directly through our messaging system.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <h4 className="font-medium">Complete Transactions</h4>
                  <p className="text-sm text-muted-foreground">Negotiate terms, arrange delivery, and complete your transactions securely.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips and Best Practices */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tips & Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">For Sellers (Farmers & Fishermen)</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Take clear, high-quality photos of your harvest</li>
                  <li>• Provide accurate quantity and quality descriptions</li>
                  <li>• Set competitive prices based on market rates</li>
                  <li>• Respond promptly to buyer inquiries</li>
                  <li>• Maintain good communication throughout the transaction</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">For Buyers</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Check seller profiles and ratings before purchasing</li>
                  <li>• Ask questions about quality and delivery terms</li>
                  <li>• Verify quantities and prices before finalizing</li>
                  <li>• Arrange secure payment methods</li>
                  <li>• Leave honest feedback after transactions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Emergency Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-3">
              For urgent issues, security concerns, or account problems, contact our emergency support:
            </p>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Emergency Hotline</p>
                <p className="text-sm text-red-600">+63 2 1234 5679</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
