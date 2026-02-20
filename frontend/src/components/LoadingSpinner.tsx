import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
