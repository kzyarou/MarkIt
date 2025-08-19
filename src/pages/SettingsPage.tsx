import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTheme } from "next-themes";
import { Switch } from '@/components/ui/switch';
import { Dialog as FeedbackDialog, DialogContent as FeedbackDialogContent, DialogHeader as FeedbackDialogHeader, DialogTitle as FeedbackDialogTitle, DialogFooter as FeedbackDialogFooter } from '@/components/ui/dialog';
import { MessageCircle, Sun, Moon, Trash2, HelpCircle, FileText, Shield, LogOut, ShieldCheck } from 'lucide-react';
import { listDrafts, deleteDraft, DraftType } from '@/utils/localDrafts';
import EducHubHeader from '@/components/EducHubHeader';
import { useBottomNav } from '@/hooks/use-mobile';

const BLUE_CLASS = 'blue-mode';

const SettingsPage = () => {
  const { logout, deleteUserProfileWithPasswordOrGoogle, isLoading, user } = useAuth();
  const { bottomNavClass } = useBottomNav();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [providerId, setProviderId] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showClearCache, setShowClearCache] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  // Remove blueMode state and effect

  React.useEffect(() => {
    if (showConfirm && user) {
      // Detect provider for the current user
      const authProvider = (window as any).firebase?.auth?.currentUser?.providerData?.[0]?.providerId || null;
      // Fallback to context user if possible
      setProviderId(authProvider || (user as any)?.providerId || null);
    }
  }, [showConfirm, user]);

  // Remove blueMode effect

  const handleDelete = async () => {
    setError('');
    setDeleting(true);
    let success = false;
    if (providerId === 'google.com') {
      success = await deleteUserProfileWithPasswordOrGoogle();
    } else {
      success = await deleteUserProfileWithPasswordOrGoogle(password);
    }
    setDeleting(false);
    if (success) {
      setShowConfirm(false);
      setPassword('');
      navigate('/auth');
    } else {
      setError('Failed to delete account. Please check your credentials and try again.');
    }
  };

  const isDark = theme === 'dark';
  const hubColor = isDark ? '#52677D' : '#2563eb';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0F1A2B] text-white' : 'bg-background'} ${bottomNavClass}`}>
      <EducHubHeader subtitle="Settings" />
      <main className="max-w-md mx-auto px-2 py-4">
        {user?.role === 'admin' && (
          <div className="bg-card rounded-xl shadow p-4 mb-6">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Admin</div>
            <div className="space-y-2">
              <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 17l9 4 9-4"/><path d="M3 12l9 4 9-4"/></svg>
                <span className="font-medium text-foreground flex-1 text-left">Sections</span>
              </button>
              <button onClick={() => navigate('/reports')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z"/><path d="M7 7h10v10H7z"/></svg>
                <span className="font-medium text-foreground flex-1 text-left">Reports</span>
              </button>
            </div>
          </div>
        )}
        {/* General Section */}
        <div className="bg-card rounded-xl shadow p-4 mb-6">
          <div className="text-xs font-semibold text-muted-foreground mb-2">General</div>
          <div className="space-y-2">
            <button onClick={() => setShowFeedback(true)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition mb-1">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div className="flex flex-col items-start text-left">
                <span className="font-medium text-foreground">Leave feedback</span>
                <span className="text-xs text-muted-foreground">Let us know how you like the app!</span>
              </div>
            </button>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              <span className="flex-1 font-medium text-foreground">Switch themes</span>
              <Switch checked={theme === 'dark'} onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')} id="theme-switch" />
            </div>
            <button onClick={() => setShowClearCache(true)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition">
              <Trash2 className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground flex-1 text-left">Clear cache</span>
            </button>
            <button onClick={() => navigate('/faq')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground flex-1 text-left">FAQ / Help</span>
            </button>
          </div>
        </div>
        {/* Legal Section */}
        <div className="bg-card rounded-xl shadow p-4 mb-6">
          <div className="text-xs font-semibold text-muted-foreground mb-2">General</div>
          <div className="space-y-2">
            <button onClick={() => navigate('/privacy')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground flex-1 text-left">Data Privacy Terms</span>
            </button>
            <button onClick={() => navigate('/terms')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground flex-1 text-left">Terms and Conditions</span>
            </button>
          </div>
        </div>
        {/* Sign out */}
        <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition mb-2">
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="font-medium text-destructive flex-1 text-left">Sign out</span>
        </button>
        {/* DANGER Section */}
        <div className="bg-card rounded-xl shadow p-4 mb-6 border border-destructive">
          <div className="text-xs font-semibold text-destructive mb-2 uppercase tracking-wider">DANGER</div>
          <div className="space-y-2">
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition border border-destructive text-destructive font-semibold"
            >
              <Trash2 className="w-5 h-5" />
              <span className="flex-1 text-left">Delete Account</span>
            </button>
            <div className="text-xs text-muted-foreground">
              <b>Warning:</b> Deleting your account is permanent and cannot be undone.
            </div>
          </div>
        </div>
        {/* Feedback Modal and other dialogs remain unchanged */}
        <Dialog open={showConfirm} onOpenChange={open => { setShowConfirm(open); setPassword(''); setError(''); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                Delete Account
              </DialogTitle>
              <DialogDescription>
                <section>
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive">
                    <b>Warning:</b> This action is <span className="font-bold">permanent</span> and cannot be undone.
                  </div>
                  <div className="mb-2 font-semibold text-foreground">What happens if you delete your account?</div>
                  <ul className="mb-4 pl-5 list-disc text-muted-foreground text-sm space-y-1">
                    <li>Your <b>profile and login credentials</b> will be permanently erased.</li>
                    <li>All your <b>grades, sections, and connections</b> will be deleted from EducHub.</li>
                    <li>You will <b>lose access</b> to all your data and will not be able to recover it.</li>
                    <li>Any students or teachers connected to your account will lose their connection to you.</li>
                    <li>This process is <b>irreversible</b>.</li>
                  </ul>
                  <div className="mb-4 p-3 bg-muted border border-muted-foreground/20 rounded text-xs text-muted-foreground">
                    <b>Legal Notice:</b> By proceeding, you acknowledge that EducHub and its developers are not responsible or liable for any data loss resulting from this action. This process is final and subject to applicable laws. You are solely responsible for your data. <b>EducHub is not accountable for any loss of information or consequences resulting from account deletion.</b>
                  </div>
                  {providerId === 'google.com' ? (
                    <div className="mb-2 text-primary font-medium">
                      You signed in with Google. You will be prompted to re-authenticate with your Google account to confirm deletion.
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 text-foreground">To confirm, please enter your password:</div>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={deleting}
                        autoFocus
                        className="mb-2"
                      />
                    </>
                  )}
                  {error && <div className="text-destructive mt-2 text-sm">{error}</div>}
                </section>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowConfirm(false)} variant="outline" disabled={deleting}>Cancel</Button>
              <Button onClick={handleDelete} variant="destructive" disabled={deleting || (providerId !== 'google.com' && !password)}>
                {deleting ? 'Deleting...' : providerId === 'google.com' ? 'Re-authenticate with Google & Delete' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Feedback Modal */}
        <FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback}>
          <FeedbackDialogContent>
            <FeedbackDialogHeader>
              <FeedbackDialogTitle>Send Feedback</FeedbackDialogTitle>
            </FeedbackDialogHeader>
            <form
              onSubmit={async e => {
                e.preventDefault();
                if (!feedbackName.trim() || !feedbackMsg.trim()) return;
                setSendingFeedback(true);
                const BOT_TOKEN = '8132985049:AAGiyBtOyypMAvjACxxLUA0GJC2TAVncXtM';
                const USER_ID = '6632313328';
                const text = `New Feedback:%0AName: ${encodeURIComponent(feedbackName)}%0AMessage: ${encodeURIComponent(feedbackMsg)}`;
                const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${USER_ID}&text=${text}`;
                try {
                  const res = await fetch(url);
                  if (res.ok) {
                    alert('Thank you! Your feedback has been sent.');
                    setShowFeedback(false);
                    setFeedbackName('');
                    setFeedbackMsg('');
                  } else {
                    alert('Failed to send feedback. Please try again later.');
                  }
                } catch {
                  alert('Failed to send feedback. Please check your connection.');
                } finally {
                  setSendingFeedback(false);
                }
              }}
              className="flex flex-col gap-3"
              style={{ minWidth: 0 }}
            >
              <label className="text-sm font-medium text-foreground" htmlFor="feedback-name">Your Name</label>
              <input
                id="feedback-name"
                type="text"
                maxLength={50}
                required
                className="border rounded px-3 py-2 text-base bg-muted"
                value={feedbackName}
                onChange={e => setFeedbackName(e.target.value)}
                placeholder="Enter your name"
              />
              <label className="text-sm font-medium text-foreground" htmlFor="feedback-msg">Message</label>
              <textarea
                id="feedback-msg"
                maxLength={500}
                required
                className="border rounded px-3 py-2 text-base bg-muted min-h-[80px] max-h-[200px] resize-none"
                value={feedbackMsg}
                onChange={e => setFeedbackMsg(e.target.value)}
                placeholder="Type your feedback..."
              />
              <FeedbackDialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowFeedback(false)} disabled={sendingFeedback}>Cancel</Button>
                <Button type="submit" disabled={sendingFeedback}>{sendingFeedback ? 'Sending...' : 'Send'}</Button>
              </FeedbackDialogFooter>
            </form>
          </FeedbackDialogContent>
        </FeedbackDialog>
        {/* End FAQ Modal */}
        <Dialog open={showClearCache} onOpenChange={open => { setShowClearCache(open); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-destructive" />
                Clear App Cache
              </DialogTitle>
              <DialogDescription>
                <section>
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive">
                    <b>Warning:</b> This will <span className="font-bold">clear all app cache</span> (local drafts, offline data) for your account on this device. This cannot be undone.
                  </div>
                  <div className="mb-2 font-semibold text-foreground">Are you sure you want to clear all app cache?</div>
                  <ul className="mb-4 pl-5 list-disc text-muted-foreground text-sm space-y-1">
                    <li>All <b>local drafts</b> (sections, attendance) will be deleted from this device.</li>
                    <li>This will not affect your data stored in the cloud.</li>
                    <li>This action cannot be undone.</li>
                  </ul>
                </section>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowClearCache(false)} variant="outline" disabled={clearingCache}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!user) return;
                  setClearingCache(true);
                  // Clear all section and attendance drafts for this user
                  for (const type of ['section', 'attendance'] as DraftType[]) {
                    const drafts = listDrafts(user.id, type);
                    for (const draft of drafts) {
                      deleteDraft(user.id, type, draft.id);
                    }
                  }
                  setClearingCache(false);
                  setShowClearCache(false);
                  window.location.reload();
                }}
                variant="destructive"
                disabled={clearingCache}
              >
                {clearingCache ? 'Clearing...' : 'Clear cache'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default SettingsPage; 