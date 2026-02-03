import Link from 'next/link';
import { PepoBee } from '@/components/PepoBee';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background-default flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PepoBee emotion="alert" size={200} />
        <h1 className="text-6xl font-bold text-gray-900 mt-8">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-4">
          Oops! The page you&#39;re looking for doesn&#39;t exist or has been moved.
        </p>
        <div className="mt-8 space-x-4">
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link href="/browse" className="btn btn-secondary">
            Browse Giveaways
          </Link>
        </div>
      </div>
    </div>
  );
}




