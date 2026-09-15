import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl sm:text-8xl font-bold mb-4">404</h1>
        <p className="text-xl sm:text-2xl mb-8">
          yeahhh theres not a page here sorry
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors rounded"
        >
          back to home
        </Link>
      </div>
    </main>
  );
}
