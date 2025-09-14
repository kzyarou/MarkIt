import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useBottomNav } from '@/hooks/use-mobile';
import { FileText, Calendar, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  const navigate = useNavigate();
  const { bottomNavClass } = useBottomNav();

  return (
    <div className={`min-h-screen bg-background px-4 ${bottomNavClass}`}>
      <div className="pt-6 pb-2 max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        </div>

        <div className="space-y-6 text-base">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Last Updated: September 2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                These Terms of Service ("Terms") govern your use of MarkIt, an agricultural marketplace platform that connects farmers, fishermen, and buyers. By using our service, you agree to be bound by these Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                By accessing or using MarkIt, you agree to comply with and be bound by these Terms. If you do not agree to these Terms, you may not use our service.
              </p>
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-yellow-800">
                  <strong>Important:</strong> These Terms constitute a legally binding agreement between you and MarkIt. Please read them carefully.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                MarkIt is a digital marketplace platform that facilitates:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Connecting farmers and fishermen with buyers</li>
                <li>Listing and browsing agricultural products and harvests</li>
                <li>Facilitating communication between users</li>
                <li>Providing market information and pricing guidance</li>
                <li>Supporting fair trade practices in agriculture</li>
              </ul>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-blue-800">
                  <strong>Note:</strong> MarkIt is a platform service. We do not directly sell or purchase agricultural products.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You must be at least 18 years old to create an account</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized account use</li>
                  <li>One account per person or business entity</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Account Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Keep your profile information current and accurate</li>
                  <li>Use your account only for legitimate business purposes</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect other users and maintain professional conduct</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. User Conduct and Prohibited Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">You agree not to:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Engage in price manipulation or unfair trading practices</li>
                  <li>Harass, abuse, or threaten other users</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use automated systems to access the platform</li>
                  <li>Post content that is illegal, harmful, or offensive</li>
                  <li>Interfere with the proper functioning of the platform</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Violation Consequences</p>
                    <p className="text-red-700 text-sm">
                      Violations may result in account suspension, termination, or legal action.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Transactions and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Transaction Terms</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>All transactions are between users directly</li>
                  <li>MarkIt facilitates connections but is not a party to transactions</li>
                  <li>Users are responsible for negotiating terms and conditions</li>
                  <li>Payment methods and terms are agreed upon between parties</li>
                  <li>Quality, quantity, and delivery terms must be clearly specified</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Dispute Resolution</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Users should attempt to resolve disputes directly first</li>
                  <li>MarkIt may provide mediation services for eligible disputes</li>
                  <li>Our dispute resolution process is voluntary and non-binding</li>
                  <li>Legal disputes should be resolved through appropriate legal channels</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Platform Content</h4>
                <p className="text-muted-foreground">
                  MarkIt and its content, features, and functionality are owned by us and are protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">User Content</h4>
                <p className="text-muted-foreground">
                  You retain ownership of content you post on MarkIt. By posting content, you grant us a license to use, display, and distribute your content as necessary to operate the platform.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Prohibited Use</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Do not copy, modify, or distribute our platform content</li>
                  <li>Do not use our trademarks or logos without permission</li>
                  <li>Do not reverse engineer or attempt to extract source code</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our service, you consent to the collection and use of information as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Disclaimers and Limitations of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Disclaimer</h4>
                <p className="text-muted-foreground">
                  MarkIt is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of any information on the platform.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, MarkIt shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-yellow-800">
                  <strong>Important:</strong> We are not responsible for transactions between users or the quality of products sold through our platform.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless MarkIt, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the platform, violation of these Terms, or infringement of any rights of another party.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Termination by You</h4>
                <p className="text-muted-foreground">
                  You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Termination by Us</h4>
                <p className="text-muted-foreground">
                  We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for other reasons at our discretion.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Effect of Termination</h4>
                <p className="text-muted-foreground">
                  Upon termination, your right to use the platform ceases immediately. We may retain certain information as required by law or for legitimate business purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Governing Law</h4>
                <p className="text-muted-foreground">
                  These Terms are governed by the laws of the Philippines. Any disputes arising from these Terms or your use of the platform shall be subject to the jurisdiction of Philippine courts.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Dispute Resolution</h4>
                <p className="text-muted-foreground">
                  Before pursuing legal action, we encourage users to attempt to resolve disputes through our customer support team. We may offer mediation services for eligible disputes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may modify these Terms at any time. We will notify users of material changes through the platform or by email. Your continued use of the platform after changes constitutes acceptance of the modified Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">kzyaroudev@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">+63 946 499 2055</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">Barangay 2, Dolores, Eastern Samar, Philippines</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
