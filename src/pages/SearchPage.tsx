import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Mail, Hash, Filter } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import MarkItHeader from '@/components/MarkItHeader';
import { useBottomNav } from '@/hooks/use-mobile';

interface MockUser {
  id: string;
  name: string;
  email: string;
  lrn?: string;
  role: 'student' | 'teacher' | 'admin';
  sections?: string[];
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { bottomNavClass } = useBottomNav();
  const [searchResults, setSearchResults] = useState<MockUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const hubColor = isDark ? '#52677D' : '#2563eb';

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
          sections: user.sections || [],
        });
      }
    });

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

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0F1A2B] text-white' : 'bg-background'} ${bottomNavClass}`}>
      <MarkItHeader subtitle="Search" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2">
                <Input
                  placeholder="Search by name, email, or LRN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <span
                      tabIndex={0}
                      role="button"
                      aria-label="Filter"
                      className="cursor-pointer flex items-center justify-center w-10 h-10 rounded hover:bg-accent transition"
                    >
                      <Filter className="w-5 h-5" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => handleShowAll('all')}
                      className={roleFilter === 'all' ? 'font-bold bg-accent' : ''}
                    >
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleShowAll('student')}
                      className={roleFilter === 'student' ? 'font-bold bg-accent' : ''}
                    >
                      Students
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleShowAll('teacher')}
                      className={roleFilter === 'teacher' ? 'font-bold bg-accent' : ''}
                    >
                      Teachers
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span
                  tabIndex={0}
                  role="button"
                  aria-label="Search"
                  className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded hover:bg-accent transition ${isSearching ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => !isSearching && handleSearch()}
                  onKeyPress={e => { if (e.key === 'Enter' && !isSearching) handleSearch(); }}
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results ({searchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.map((user) => {
                  const isAdmin = user.email === 'zacharythanos@gmail.com' || user.role === 'admin'
                  return (
                    <div key={user.id} className={`p-4 border rounded-lg hover:bg-accent ${isAdmin ? 'border-red-500/60 bg-red-50 dark:bg-red-950/30' : ''}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAdmin ? 'bg-red-600 text-white font-bold' : 'bg-blue-100'}`}>
                            {isAdmin ? 'DEV' : <User className="w-5 h-5 text-blue-600" />}
                          </div>
                          <div>
                            <h3 className={`font-medium flex items-center gap-2 ${isAdmin ? 'text-red-700 dark:text-red-300 font-semibold' : ''}`}>{user.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Mail className="w-4 h-4" />
                              {user.email}
                            </div>
                            {user.lrn && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Hash className="w-4 h-4" />
                                LRN: {user.lrn}
                              </div>
                            )}
                            {user.sections && user.sections.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {user.sections.map((section, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {section}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="mt-3">
                              <a href={`/profile/${user.id}`} className={`block w-full sm:inline-block sm:w-auto px-3 py-2 text-sm rounded transition text-center ${isAdmin ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>View Full Profile</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {hasSearched && searchResults.length === 0 && !isSearching && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">Try searching with different keywords.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
