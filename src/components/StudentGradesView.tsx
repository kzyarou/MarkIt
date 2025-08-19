import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeOff, RefreshCw } from 'lucide-react';
import { Grade } from '@/types/grading';
import { GradesService, StudentUserService } from '@/services/gradesService';
import { getGradeColor, getGradeLevel } from '@/utils/gradeCalculations';
import { useLRN } from '@/hooks/useLRN';
import { useBottomNav } from '@/hooks/use-mobile';

interface StudentGradesViewProps {
  userId: string;
}

export function StudentGradesView({ userId }: StudentGradesViewProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [activeSectionIds, setActiveSectionIds] = useState<string[]>([]);
  const [forceSyncing, setForceSyncing] = useState(false);
  const [sectionInfo, setSectionInfo] = useState<{ gradeLevel: string; classification?: string } | null>(null);
  const lrn = useLRN();
  const { bottomNavClass } = useBottomNav();

  // Debug logging
  useEffect(() => {
    console.log('[StudentGradesView] userId:', userId);
    console.log('[StudentGradesView] lrn:', lrn);
    console.log('[StudentGradesView] activeSectionIds:', activeSectionIds);
    console.log('[StudentGradesView] grades:', grades);
    console.log('[StudentGradesView] sectionInfo:', sectionInfo);
    if (grades.length > 0) {
      grades.forEach(g => {
        console.log(`[StudentGradesView] grade: subject=${g.subject}, sectionId=${g.sectionId}, hidden=${g.hidden}, score=${g.score}`);
      });
    }
  }, [userId, lrn, activeSectionIds, grades, sectionInfo]);

  const loadGrades = async () => {
    setLoading(true);
    try {
      // Fetch all grades, including hidden
      const userGrades = await GradesService.getGradesForUser(userId, true);
      setGrades(userGrades);
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchSectionId() {
      setSectionError(null);
      if (!lrn) return;
      try {
        const res = await StudentUserService.getUserSections(lrn);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const sectionData = res.data[0];
          setSectionId(sectionData.sectionId);
          setActiveSectionIds(res.data.map((conn: any) => conn.sectionId));
          
          // Extract section info for grade level determination
          if (sectionData.gradeLevel) {
            setSectionInfo({
              gradeLevel: sectionData.gradeLevel,
              classification: sectionData.classification
            });
          }
        } else {
          setSectionId(null);
          setActiveSectionIds([]);
          setSectionError('No section found for your account.');
        }
      } catch (e) {
        setSectionId(null);
        setActiveSectionIds([]);
        setSectionError('Failed to fetch section info.');
      }
    }
    fetchSectionId();
  }, [lrn]);

  const debugSync = async () => {
    if (!sectionId) {
      setSectionError('No section found for debug sync.');
      return;
    }
    setSyncing(true);
    try {
      const debugInfo = await GradesService.debugGradeSync(userId, sectionId);
      console.log('Debug sync info:', debugInfo);
      await loadGrades();
    } catch (error) {
      console.error('Debug sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Add a force sync function for students
  const forceSyncGrades = async () => {
    if (!lrn) return;
    setForceSyncing(true);
    try {
      const res = await StudentUserService.getUserSections(lrn);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        for (const conn of res.data) {
          await GradesService.debugGradeSync(userId, conn.sectionId);
        }
        await loadGrades();
      }
    } catch (error) {
      console.error('Force sync error:', error);
    } finally {
      setForceSyncing(false);
    }
  };

  useEffect(() => {
    loadGrades();
  }, [userId]);

  // Only show grades for active sections
  const filteredGrades = grades.filter(g => activeSectionIds.includes(g.sectionId));
  const visibleGrades = filteredGrades.filter(g => !g.hidden);

  if (!loading && activeSectionIds.length === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <EyeOff className="w-5 h-5" />
            Not Connected to Any Section
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-600 mb-4">
            You are not connected to any section. Please contact your teacher to be connected.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If grades exist but all are hidden, show a message
  if (filteredGrades.length > 0 && visibleGrades.length === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <EyeOff className="w-5 h-5" />
            Grades Temporarily Hidden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-600 mb-4">
            Your teacher has temporarily hidden your grades. Check back later for updates.
          </p>
          {sectionError && (
            <p className="text-red-600 text-sm mb-2">{sectionError}</p>
          )}
          <Button onClick={forceSyncGrades} size="sm" variant="outline" disabled={forceSyncing} className="mb-2">
            <RefreshCw className={`w-4 h-4 mr-2 ${forceSyncing ? 'animate-spin' : ''}`} />
            {forceSyncing ? 'Syncing...' : 'Refresh'}
          </Button>
          {import.meta.env.MODE === 'development' && (
            <Button
              onClick={debugSync}
              disabled={syncing || !sectionId}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              Debug Sync
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (visibleGrades.length === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <EyeOff className="w-5 h-5" />
            No Grades Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-600 mb-4">
            No grades are available for your account at this time.
          </p>
          {sectionError && (
            <p className="text-red-600 text-sm mb-2">{sectionError}</p>
          )}
          <Button onClick={forceSyncGrades} size="sm" variant="outline" disabled={forceSyncing} className="mb-2">
            <RefreshCw className={`w-4 h-4 mr-2 ${forceSyncing ? 'animate-spin' : ''}`} />
            {forceSyncing ? 'Syncing...' : 'Refresh'}
          </Button>
          {import.meta.env.MODE === 'development' && (
            <Button
              onClick={debugSync}
              disabled={syncing || !sectionId}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              Debug Sync
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Group grades by subject
  const gradesBySubject = visibleGrades.reduce((acc, grade) => {
    if (!acc[grade.subject]) {
      acc[grade.subject] = [];
    }
    acc[grade.subject].push(grade);
    return acc;
  }, {} as Record<string, Grade[]>);

  return (
    <div className={`space-y-6 ${bottomNavClass}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Grades</h2>
        <Button onClick={forceSyncGrades} size="sm" variant="outline" disabled={forceSyncing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${forceSyncing ? 'animate-spin' : ''}`} />
          {forceSyncing ? 'Syncing...' : 'Refresh'}
        </Button>
      </div>

      {Object.entries(gradesBySubject).map(([subject, subjectGrades]) => {
        const averageGrade = subjectGrades.length > 0
          ? Math.round(subjectGrades.reduce((sum, grade) => sum + grade.score, 0) / subjectGrades.length)
          : 0;

        // Determine if student is in senior high school
        const isSenior = sectionInfo && (
          sectionInfo.classification === 'senior' || 
          ['11', '12'].includes(sectionInfo.gradeLevel)
        );

        // Define periods based on grade level
        const periods = isSenior 
          ? [
              { key: 1, label: '1st Semester', quarters: [1, 2] },
              { key: 2, label: '2nd Semester', quarters: [3, 4] }
            ]
          : [
              { key: 1, label: 'Quarter 1', quarters: [1] },
              { key: 2, label: 'Quarter 2', quarters: [2] },
              { key: 3, label: 'Quarter 3', quarters: [3] },
              { key: 4, label: 'Quarter 4', quarters: [4] }
            ];

        return (
          <Card key={subject}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {subject}
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getGradeColor(averageGrade)}`}>
                    {averageGrade}
                  </span>
                  <Badge variant="secondary">
                    {getGradeLevel(averageGrade)}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-1 md:grid-cols-${periods.length} gap-4`}>
                {periods.map(period => {
                  // For semesters, calculate the average of the two quarters
                  // For quarters, just show the single quarter grade
                  let periodGrade: number | null = null;
                  let periodLabel = period.label;
                  
                  if (isSenior) {
                    // Semester: average of two quarters
                    const quarterGrades = period.quarters.map(q => 
                      subjectGrades.find(g => g.quarter === q)?.score
                    ).filter(score => score !== undefined) as number[];
                    
                    if (quarterGrades.length > 0) {
                      periodGrade = Math.round(quarterGrades.reduce((sum, score) => sum + score, 0) / quarterGrades.length);
                    }
                  } else {
                    // Quarter: single grade
                    const quarterGrade = subjectGrades.find(g => g.quarter === period.quarters[0]);
                    periodGrade = quarterGrade?.score || null;
                  }
                  
                  return (
                    <div key={period.key} className="text-center p-3 border rounded">
                      <p className="text-sm text-gray-600 mb-1">{periodLabel}</p>
                      <p className={`text-xl font-semibold ${
                        periodGrade !== null ? getGradeColor(periodGrade) : 'text-gray-400'
                      }`}>
                        {periodGrade !== null ? periodGrade : '--'}
                      </p>
                      {isSenior && period.quarters.length > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Q{period.quarters[0]}, Q{period.quarters[1]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
