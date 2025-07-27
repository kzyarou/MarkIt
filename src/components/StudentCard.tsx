import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, BookOpen, Link, Unlink, RefreshCw } from 'lucide-react';
import { Student } from '@/types/grading';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface StudentCardProps {
  student: Student;
  onManageSubjects: (student: Student) => void;
  onManageConnection: (student: Student) => void;
  onForceSync?: (student: Student) => void;
  onShowGrades?: (student: Student) => void;
}

export function StudentCard({ student, onManageSubjects, onManageConnection, onForceSync, onShowGrades }: StudentCardProps) {
  const isConnected = !!student.connectedUserId;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {student.name}
          </div>
          {isConnected && (
            <Badge variant="secondary" className="text-green-600 bg-green-50">
              <Link className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {student.lrn && (
          <div className="text-sm text-gray-600">
            <strong>LRN:</strong> {student.lrn}
          </div>
        )}
        
        {isConnected && (
          <>
            <div className="space-y-1 text-sm">
              <div className="text-gray-600">
                <strong>Connected User:</strong>
              </div>
              <div className="text-base font-bold text-blue-800">
                LRN: {student.connectedUserLRN}
              </div>
              <div className="text-base font-bold text-blue-800">
                Email: {student.connectedUserEmail}
              </div>
            </div>
            {(onShowGrades || onForceSync) && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2 flex items-center justify-center text-green-700 border-green-300"
                onClick={() => {
                  if (onShowGrades) onShowGrades(student);
                  if (onForceSync) onForceSync(student);
                }}
              >
                Show Grades
              </Button>
            )}
          </>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => onManageSubjects(student)}
            className="flex-1"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Manage Subjects
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onManageConnection(student)}
            className={isConnected ? 'text-orange-600 hover:text-orange-700' : 'text-blue-600 hover:text-blue-700'}
          >
            {isConnected ? (
              <>
                <Unlink className="w-4 h-4 mr-1" />
                Disconnect
              </>
            ) : (
              <>
                <Link className="w-4 h-4 mr-1" />
                Connect User
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
