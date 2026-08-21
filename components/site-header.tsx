'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LoginDialog } from './login-dialog';

export function SiteHeader() {
	const params = useSearchParams();
	const pathname = usePathname();
	const [open, setOpen] = useState(params.get('login') === '1');
	const [pageTitle, setPageTitle] = useState('');
	const [pageDesc, setPageDesc] = useState('');

	const section = pathname === '/about' ? 'About' : 'Work';

	useEffect(() => {
		async function load() {
			if (pathname?.startsWith('/projects/')) {
				const parts = pathname.split('/').filter(Boolean);
				const slug = parts[1];
				try {
					const res = await fetch(`/api/project/${slug}`);
					if (res.ok) {
						const data = await res.json();
						setPageTitle(data.title || '');
						setPageDesc(data.description || '');
						return;
					}
				} catch (e) {
					// ignore
				}
			}
			setPageTitle('');
			setPageDesc('');
		}
		load();
	}, [pathname]);

	return (
		<>
			<header className="page flex items-center justify-between py-5 text-lg">
				<div className="flex-1 min-w-0 mr-4">
					<Link className="text-xl leading-none no-underline block whitespace-nowrap truncate" href="/">
						jacks art portfolio <span className="text-zinc-500 hidden sm:inline">/ {section}{pageTitle ? ` / ${pageTitle}` : ''}{pageDesc ? ` / ${pageDesc}` : ''}</span>
					</Link>
				</div>
				<nav aria-label="Main navigation" className="flex items-center gap-4 shrink-0">
					<Link className="no-underline hover:underline hidden sm:inline" href="/">Work</Link>
					<Link className="no-underline hover:underline hidden sm:inline" href="/about">About</Link>
					<a className="no-underline hover:underline hidden sm:inline" href="https://jackzif.dev">dev page</a>
					<button onClick={() => setOpen(true)} className="text-red-600 hover:text-red-700 bg-transparent border-0 px-1 py-1" style={{textTransform:'uppercase'}}>LOGIN</button>
				</nav>
			</header>
			{/* mobile nav links below header on small screens */}
			<nav aria-label="Mobile navigation" className="sm:hidden page flex gap-5 pb-3 text-base border-b border-stone-100">
				<Link className="no-underline hover:underline" href="/">Work</Link>
				<Link className="no-underline hover:underline" href="/about">About</Link>
				<a className="no-underline hover:underline" href="https://jackzif.dev">dev page</a>
			</nav>
			<LoginDialog open={open} onClose={() => setOpen(false)} />
		</>
	);
}
