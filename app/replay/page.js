import { Suspense } from 'react';
import ReplayPage from '@/components/ReplayPage';

export default function ReplayRoute() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center text-zinc-500 text-sm">
          Loading replay…
        </div>
      }
    >
      <ReplayPage />
    </Suspense>
  );
}
