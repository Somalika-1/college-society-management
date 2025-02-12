// src/components/societies/MembersList.tsx
import React from "react";
import { User, Mail, Calendar } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedDate: Date;
}

interface MembersListProps {
  members: Member[];
  onRemoveMember?: (memberId: string) => void;
}

export default function MembersList({
  members,
  onRemoveMember,
}: MembersListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Society Members</h3>
      </div>
      <div className="divide-y">
        {members.map((member) => (
          <div key={member.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <h4 className="font-medium">{member.name}</h4>
                </div>
                <div className="mt-1 text-sm text-gray-500 space-y-1">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {member.email}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {member.joinedDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
              {onRemoveMember && (
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
