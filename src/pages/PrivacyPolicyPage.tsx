import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useBottomNav } from '@/hooks/use-mobile';
import { ShieldCheck, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const { bottomNavClass } = useBottomNav();

  return (
    <div className={`min-h-screen bg-background px-4 ${bottomNavClass}`}>
      <div className="pt-6 pb-2 max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        </div>

        <div className="space-y-6 text-base">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Last Updated: September 2025 - V1.0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This Privacy Policy describes how MarkIt ("we," "our," or "us") collects, uses, and protects your personal information when you use our agricultural marketplace platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Name, email address, and phone number</li>
                  <li>Business information (farm/fishery details, business registration)</li>
                  <li>Location data (for marketplace matching)</li>
                  <li>Profile photos and business documentation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Transaction Information</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Harvest listings and product details</li>
                  <li>Purchase history and transaction records</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Communication records between buyers and sellers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Technical Information</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Device information and IP address</li>
                  <li>App usage data and preferences</li>
                  <li>Location data (with your permission)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Provision</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Facilitate connections between farmers, fishermen, and buyers</li>
                  <li>Process transactions and manage marketplace operations</li>
                  <li>Provide customer support and resolve disputes</li>
                  <li>Send important service updates and notifications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Platform Improvement</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Analyze usage patterns to improve our services</li>
                  <li>Develop new features and functionality</li>
                  <li>Conduct research and analytics</li>
                  <li>Prevent fraud and ensure platform security</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Communication</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Send marketing communications (with your consent)</li>
                  <li>Provide relevant agricultural information and tips</li>
                  <li>Notify you about new features and opportunities</li>
                  <li>Share important policy updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">We may share your information with:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Other Users:</strong> Basic profile information and listings to facilitate transactions</li>
                  <li><strong>Service Providers:</strong> Third-party companies that help us operate our platform (payment processors, cloud storage, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-yellow-800 font-medium">
                  We never sell your personal information to third parties for marketing purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>End-to-end encryption for sensitive communications</li>
                <li>Secure data storage with regular backups</li>
                <li>Access controls and authentication systems</li>
                <li>Regular security audits and updates</li>
                <li>Staff training on data protection practices</li>
              </ul>
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-800 text-sm">
                  <strong>Important:</strong> No method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">You have the right to:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restriction:</strong> Limit how we process your information</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-blue-800">
                  To exercise these rights, contact us at <strong>kzyaroudev@gmail.com</strong> or use the settings in your account.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Account information: Until you delete your account</li>
                <li>Transaction records: 7 years for tax and legal compliance</li>
                <li>Communication logs: 2 years for customer support purposes</li>
                <li>Marketing data: Until you opt-out or delete your account</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                MarkIt is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
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