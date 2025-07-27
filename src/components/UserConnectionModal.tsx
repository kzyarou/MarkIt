import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Mail, Hash, Link, Unlink } from 'lucide-react';
import { Student } from '@/types/grading';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onConnect: (student: Student, userData: any) => void;
  onDisconnect: (student: Student) => void;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
  lrn?: string;
  role: 'student' | 'teacher';
}

export function UserConnectionModal({ isOpen, onClose, student, onConnect, onDisconnect }: UserConnectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MockUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'connect' | 'disconnect' | null>(null);

  const handleSearch = async (roleOverride?: 'all' | 'student' | 'teacher') => {
    const roleToUse = roleOverride || roleFilter;
    setRoleFilter(roleToUse);
    setIsSearching(true);
    setHasSearched(true);

    const usersRef = collection(db, 'users');
    let q;
    if (roleToUse === 'all') {
      q = query(usersRef);
    } else {
      q = query(usersRef, where('role', '==', roleToUse));
    }
    const querySnapshot = await getDocs(q);

    const queryLower = searchQuery.toLowerCase();
    let results: MockUser[] = [];
    querySnapshot.forEach((doc) => {
      const user = doc.data() as any;
      // Exclude @example.com emails
      if (
        !user.email.endsWith('@example.com') &&
        (
          queryLower === '' ||
          user.name.toLowerCase().includes(queryLower) ||
          user.email.toLowerCase().includes(queryLower) ||
          (user.lrn && user.lrn.toLowerCase().includes(queryLower))
        )
      ) {
        results.push({
          id: doc.id,
          name: user.name,
          email: user.email,
          lrn: user.lrn,
          role: user.role,
        });
      }
    });

    // Optionally include the current user if they match
    if (
      currentUser &&
      (roleToUse === 'all' || currentUser.role === roleToUse) &&
      !currentUser.email.endsWith('@example.com') &&
      (
        queryLower === '' ||
        currentUser.name.toLowerCase().includes(queryLower) ||
        currentUser.email.toLowerCase().includes(queryLower) ||
        (currentUser.lrn && currentUser.lrn.toLowerCase().includes(queryLower))
      ) &&
      !results.some(u => u.id === currentUser.id)
    ) {
      results = [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          lrn: currentUser.lrn,
          role: currentUser.role as 'student' | 'teacher',
        },
        ...results
      ];
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleShowAll = (role: 'all' | 'student' | 'teacher') => {
    setSearchQuery('');
    handleSearch(role);
  };

  const handleConnect = async (userData: MockUser) => {
    setLoadingAction('connect');
    try {
      const updatedStudent = {
        ...student,
        connectedUserId: userData.id,
        connectedUserLRN: userData.lrn,
        connectedUserEmail: userData.email
      };
      await onConnect(updatedStudent, userData);
      toast({
        title: "User Connected",
        description: `${student.name} has been connected to ${userData.name}.`
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect user.',
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDisconnect = async () => {
    setLoadingAction('disconnect');
    try {
      await onDisconnect(student);
      toast({
        title: "User Disconnected",
        description: `${student.name} has been disconnected from the user account.`
      });
      setShowConfirmDisconnect(false);
      onClose();
    } catch (error) {
      toast({
        title: 'Disconnection Failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect user.',
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const isConnected = !!student.connectedUserId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            {isConnected ? 'Manage Connection' : 'Connect User'} - {student.name}
          </DialogTitle>
          <DialogDescription>
            {isConnected
              ? 'You can disconnect the current user or search for a different user to connect to this student.'
              : 'Search for a user by name, email, or LRN to connect to this student.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isConnected && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Currently Connected</h3>
              <div className="space-y-1 text-sm text-green-700">
                <div>LRN: {student.connectedUserLRN}</div>
                <div>Email: {student.connectedUserEmail}</div>
              </div>
              <Button
                onClick={() => setShowConfirmDisconnect(true)}
                variant="outline"
                size="sm"
                className="mt-3 text-red-600 hover:text-red-700"
                disabled={loadingAction === 'disconnect'}
              >
                <Unlink className="w-4 h-4 mr-2" />
                {loadingAction === 'disconnect' ? 'Disconnecting...' : 'Disconnect User'}
              </Button>
            </div>
          )}

          {showConfirmDisconnect && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-2">Confirm Disconnect</h3>
                <p className="mb-4">Are you sure you want to disconnect <b>{student.name}</b> from the user account?</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowConfirmDisconnect(false)} disabled={loadingAction === 'disconnect'}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnect} disabled={loadingAction === 'disconnect'}>
                    {loadingAction === 'disconnect' ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-4">
              {isConnected ? 'Search for a different user:' : 'Search for a user to connect:'}
            </h3>
            
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Search by name, email, or LRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={loadingAction === 'connect' || loadingAction === 'disconnect'}
              />
              <div className="flex gap-2">
                <Button onClick={() => handleShowAll('all')} variant={roleFilter === 'all' ? 'default' : 'outline'} disabled={loadingAction === 'connect' || loadingAction === 'disconnect'}>All</Button>
                <Button onClick={() => handleShowAll('student')} variant={roleFilter === 'student' ? 'default' : 'outline'} disabled={loadingAction === 'connect' || loadingAction === 'disconnect'}>Students</Button>
                <Button onClick={() => handleShowAll('teacher')} variant={roleFilter === 'teacher' ? 'default' : 'outline'} disabled={loadingAction === 'connect' || loadingAction === 'disconnect'}>Teachers</Button>
              </div>
              <Button onClick={() => handleSearch()} disabled={isSearching || loadingAction === 'connect' || loadingAction === 'disconnect'}>
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div key={user.id} className="p-3 border rounded-lg hover:bg-accent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium flex items-center gap-2">{user.name}
                            <Badge variant={user.role === 'teacher' ? 'default' : 'outline'} className={user.role === 'teacher' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 border-gray-300'}>
                              {user.role === 'teacher' ? 'Teacher' : 'Student'}
                            </Badge>
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          {user.lrn && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Hash className="w-3 h-3" />
                              LRN: {user.lrn}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Button
                          onClick={() => handleConnect(user)}
                          size="sm"
                          disabled={student.connectedUserId === user.id || loadingAction === 'connect' || loadingAction === 'disconnect'}
                        >
                          {loadingAction === 'connect' && student.connectedUserId !== user.id ? 'Connecting...' : (student.connectedUserId === user.id ? 'Connected' : 'Connect')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasSearched && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No users found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
