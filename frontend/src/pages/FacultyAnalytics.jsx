import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

const StatCard = ({ title, value, color }) => (
	<div className="card p-6 flex-1 relative overflow-hidden group">
		<div style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, background: `radial-gradient(circle at top right, ${color}10, transparent 70%)` }} />
		<div className="form-label mb-2 group-hover:text-[var(--text-primary)] transition-colors">{title}</div>
		<div className="stat-num text-4xl" style={{ color: color }}>{value}</div>
	</div>
);

export default function FacultyAnalytics() {
	const { token, user } = useContext(AuthContext);
	const [students, setStudents] = useState([]);
	const [batchStats, setBatchStats] = useState([]);
	const [filtered, setFiltered] = useState([]);
	const [batchFilter, setBatchFilter] = useState('all');
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [downloadError, setDownloadError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				const res = await api.fetchDepartmentUsers(token, user.department_id);
				const sorted = res.sort((a, b) => b.rating - a.rating);
				setStudents(sorted);
				setFiltered(sorted);
				try {
					const bs = await api.fetchDepartmentBatchStats(token, user.department_id);
					setBatchStats(bs.batchStats || []);
				} catch (err) {
					console.warn('Failed to fetch department batch stats', err);
				}
			} catch (err) {
				console.error(err);
				setError('Failed to load department users');
			} finally {
				setLoading(false);
			}
		};
		if (token && user?.department_id) load();
	}, [token, user]);

	useEffect(() => {
		let result = students;
		if (batchFilter !== 'all') {
			result = result.filter((s) => s.batch === batchFilter);
		}
		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter(
				(s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
			);
		}
		setFiltered(result);
	}, [students, batchFilter, search]);

	const handleDownload = async () => {
		setDownloadError(null);
		try {
			const blob = await api.downloadDepartmentBatchStats(token, user.department_id);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `dept_stats.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error(err);
			setDownloadError('Failed to download CSV');
		}
	};

	if (loading) return (
		<div className="card p-12 text-center">
			<div className="ui-spinner ui-spinner-lg mx-auto mb-3" />
			<div className="muted font-display uppercase tracking-widest text-xs">Synchronizing Analytics...</div>
		</div>
	);
	if (error) return (
		<div className="card p-6 bg-[rgba(239,68,68,0.1)] text-[var(--red)] border border-[rgba(239,68,68,0.2)] text-center">
			{error}
		</div>
	);

	console.log(user);

	const batches = Array.from(new Set(students.map((s) => s.batch))).sort();
	const avgRating = students.length > 0 ? students.reduce((a, b) => a + b.rating, 0) / students.length : 0;
	const deptName = user?.department_name || 'Department';

	return (
		<div className="anim-fade-in space-y-8" style={{ padding: '24px 0' }}>
			<div className="flex flex-col gap-2">
				<h1 className="text-4xl font-extrabold tracking-tight">Faculty Analytics</h1>
				<p className="text-[var(--text-secondary)]">Department oversight and student performance metrics for <span className="text-[var(--cyan)] font-bold">{deptName}</span>.</p>
			</div>

			{/* Top Row: Overall Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard title="Total Students" value={students.length} color="var(--violet)" />
				<StatCard title="Avg Rating" value={avgRating.toFixed(0)} color="var(--amber)" />
				<StatCard title="Top Rating" value={Math.max(...students.map(s => s.rating), 0)} color="var(--cyan)" />
				<StatCard title="Active Batches" value={batches.length} color="var(--emerald)" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column: Batch Stats */}
				<div className="lg:col-span-1 space-y-6">
					<div className="card p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-bold flex items-center gap-2">
								<svg className="w-5 h-5 text-[var(--cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
								Batch Summary
							</h3>
							<button className="btn btn-ghost btn-sm" onClick={handleDownload} title="Export CSV">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
							</button>
						</div>

						{downloadError && (
							<div className="mb-4 p-3 rounded-xl bg-[rgba(239,68,68,0.1)] text-[var(--red)] border border-[rgba(239,68,68,0.2)] text-xs">
								{downloadError}
							</div>
						)}

						<div className="space-y-4">
							{batchStats && batchStats.length > 0 ? (
								batchStats.map((b) => (
									<div key={b.batch} className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl group hover:border-[var(--border-accent)] transition-all">
										<div className="flex items-center justify-between mb-3">
											<span className="font-bold text-[var(--text-primary)]">Batch {b.batch}</span>
											<span className="badge badge-cyan">{b.users_count} Users</span>
										</div>
										<div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[var(--border)]">
											<div className="flex flex-col">
												<span className="text-[10px] uppercase muted font-bold">Avg. Solved</span>
												<span className="stat-num text-[var(--emerald)]">{Number(b.avg_solved || 0).toFixed(1)}</span>
											</div>
											<div className="flex flex-col text-right">
												<span className="text-[10px] uppercase muted font-bold">Avg. Rating</span>
												<span className="stat-num text-[var(--amber)]">{Number(b.avg_rating || 0).toFixed(0)}</span>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="muted text-sm text-center py-8 opacity-50 border border-dashed border-[var(--border)] rounded-xl">No batch data available.</div>
							)}
						</div>
					</div>
				</div>

				{/* Right Column: Leaderboard */}
				<div className="lg:col-span-2 space-y-6">
					<div className="card p-6">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
							<h3 className="text-xl font-bold flex items-center gap-2">
								<svg className="w-5 h-5 text-[var(--amber)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
								Student Performance
							</h3>
							<div className="flex items-center gap-4">
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
										<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
									</span>
									<input
										type="text"
										placeholder="Search..."
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										className="form-input !text-xs !py-1.5 !pl-9 !w-40 !bg-[var(--surface-2)]"
									/>
								</div>
								<select
									value={batchFilter}
									onChange={(e) => setBatchFilter(e.target.value)}
									className="form-select !text-xs !py-1.5 !bg-[var(--surface-2)] !w-32"
								>
									<option value="all">All Batches</option>
									{batches.map((b) => <option key={b} value={b}>Batch {b}</option>)}
								</select>
							</div>
						</div>

						<div className="overflow-x-auto rounded-xl border border-[var(--border)]">
							<table className="data-table">
								<thead>
									<tr>
										<th>Student</th>
										<th className="!text-center">Batch</th>
										<th className="!text-center">Rating</th>
										<th className="!text-center">Activity</th>
									</tr>
								</thead>
								<tbody>
									{filtered.map((s) => (
										<tr key={s.id} onClick={() => navigate(`/profile/${s.id}`)} className="cursor-pointer">
											<td>
												<div className="font-bold text-[var(--text-primary)] group-hover:text-[var(--cyan)] transition-colors">{s.name}</div>
												<div className="text-[10px] muted uppercase font-mono">{s.email}</div>
											</td>
											<td className="text-center font-mono text-sm">{s.batch}</td>
											<td className="text-center">
												<span className="badge badge-amber font-mono font-bold">{s.rating}</span>
											</td>
											<td className="text-center">
												<div className="w-32 h-1.5 bg-[var(--surface-3)] rounded-full mx-auto overflow-hidden">
													<div
														className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--emerald)]"
														style={{ width: `${Math.min(100, (s.rating / (Math.max(...students.map(x => x.rating), 1))) * 100)}%` }}
													/>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{filtered.length === 0 && (
								<div className="p-12 text-center muted italic">No students found matching filters.</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
