'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LoginDialog } from './login-dialog';
import { ProjectInfoButton } from './project-info-button';

function formatProjectDate(date: string | null) {
	if (!date) return '';
	return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`));
}

export function SiteHeader() {
	const params = useSearchParams();
	const pathname = usePathname();
	const [open, setOpen] = useState(params.get('login') === '1');
	const [menuOpen, setMenuOpen] = useState(false);
	const [pageTitle, setPageTitle] = useState('');
	const [pageDesc, setPageDesc] = useState('');
	const [pageDate, setPageDate] = useState('');

	const section = pathname === '/about' ? 'About' : 'Work';

	useEffect(() => {
		if (menuOpen) setMenuOpen(false);
	}, [pathname]);

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
						setPageDate(data.project_date || '');
						return;
					}
				} catch (e) {
					// ignore
				}
			}
			setPageTitle('');
			setPageDesc('');
			setPageDate('');
		}
		load();
	}, [pathname]);

	return (
		<>
			<header className="page flex items-center justify-between py-3 sm:py-5 text-sm sm:text-lg">
				<div className="flex-1 min-w-0 mr-4 flex items-center gap-1">
					<Link className="text-lg sm:text-xl leading-none no-underline block whitespace-nowrap" href="/">
						jacks art portfolio <span className="text-zinc-500 hidden sm:inline">/ {section}{pageTitle ? ` / ${pageTitle}` : ''}</span>
					</Link>
					{pageTitle && pageDesc && (
						<div className="hidden sm:flex items-center gap-1 shrink-0">
							<ProjectInfoButton
								title={pageTitle}
								date={formatProjectDate(pageDate)}
								description={pageDesc}
							/>
						</div>
					)}
				</div>
				<nav aria-label="Main navigation" className="flex items-center gap-4 shrink-0">
					<Link className="no-underline hover:underline hidden sm:inline" href="/">Work</Link>
					<Link className="no-underline hover:underline hidden sm:inline" href="/#notebook">Notebook</Link>
					<Link className="no-underline hover:underline hidden sm:inline" href="/about">About</Link>
					<a className="no-underline hover:underline hidden sm:inline" href="https://jackzif.dev">dev page</a>
					<button onClick={() => setOpen(true)} className="text-red-600 hover:text-red-700 bg-transparent border-0 px-1 py-1 hidden sm:block" style={{textTransform:'uppercase'}}>LOGIN</button>
					{/* Mobile menu button */}
					<button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden text-black bg-transparent border-0 p-2" aria-label="Menu" aria-expanded={menuOpen}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
				</nav>
			</header>
			{/* Mobile dropdown menu */}
			{menuOpen && (
				<nav aria-label="Mobile navigation" className="sm:hidden page flex flex-col gap-3 pb-3 text-base border-b border-stone-300 bg-white">
					<Link className="no-underline hover:underline" href="/">Work</Link>
					<Link className="no-underline hover:underline" href="/#notebook">Notebook</Link>
					<Link className="no-underline hover:underline" href="/about">About</Link>
					<a className="no-underline hover:underline" href="https://jackzif.dev">dev page</a>

					<button onClick={() => { setOpen(true); setMenuOpen(false); }} className="text-red-600 hover:text-red-700 bg-transparent border-0 text-left py-1" style={{textTransform:'uppercase'}}>LOGIN</button>
				</nav>
			)}
			<LoginDialog open={open} onClose={() => setOpen(false)} />
		</>
	);
}
