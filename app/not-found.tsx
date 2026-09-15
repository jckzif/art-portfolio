import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-white gap-8">
      <h1 className="text-9xl font-bold">404</h1>
      <Link href="/" className="text-lg underline hover:no-underline">
        back to home
      </Link>
    </main>
  );
}
