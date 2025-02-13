import { PendingRequest } from "@/types";

interface PendingRequestsProps {
  requests: PendingRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
  loading?: boolean;
}

export default function PendingRequests({
  requests,
  onApprove,
  onReject,
  onViewDetails,
  loading = false,
}: PendingRequestsProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">No pending requests</div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="border-b border-gray-100 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{request.title}</h3>
              <p className="text-sm text-gray-500">{request.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-400">
                  {request.createdAt.toLocaleDateString()}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">
                  Requested by: {request.requestedBy}
                </span>
              </div>
              <div className="mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    request.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </span>
                {request.type === "society_creation" && (
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    New Society
                  </span>
                )}
                {request.type === "head_approval" && (
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                    Head Approval
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {request.status === "pending" && (
                <>
                  <button
                    onClick={() => onApprove(request.id)}
                    className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(request.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => onViewDetails(request.id)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
