import React from 'react';
import { Dialog } from './ui/dialog';
import { Mail, Hash, Phone, User, Facebook, Calendar, BadgeCheck } from 'lucide-react';

interface ViewUserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
}

export const ViewUserProfileModal: React.FC<ViewUserProfileModalProps> = ({ open, onClose, user }) => {
  if (!user) return null;
  const handle = user?.email ? `@${user.email.split('@')[0]}` : user?.name ? `@${user.name.replace(/\s+/g, '').toLowerCase()}` : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center text-4xl font-bold mb-4">
            {user?.name?.[0] || <User />}
          </div>
          <h2 className="text-2xl font-semibold mb-1">{user?.name}</h2>
          <div className="text-gray-500 mb-2">{handle}</div>
          {user?.role && (
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="w-4 h-4 text-blue-500" />
              <span className="capitalize text-sm">{user.role}</span>
            </div>
          )}
          {user?.bio && <div className="mb-2 text-center text-gray-700 dark:text-gray-300">{user.bio}</div>}
          <div className="flex flex-col gap-2 w-full mt-4">
            {user?.email && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            )}
            {user?.contactNo && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                <span>{user.contactNo}</span>
              </div>
            )}
            {user?.age && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Age: {user.age}</span>
              </div>
            )}
            {user?.facebook && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Facebook className="w-4 h-4" />
                <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="underline">Facebook</a>
              </div>
            )}
            {user?.lrn && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Hash className="w-4 h-4" />
                <span>LRN: {user.lrn}</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}; 