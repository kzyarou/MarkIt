import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Shield, Database, RefreshCw, Ban, Clock } from 'lucide-react'
import { collection, getDocs, limit, orderBy, query, Timestamp, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface UserRow {
	id: string
	name: string
	email: string
	status?: 'online' | 'offline'
	lastSeen?: Timestamp
	device?: string
	banned?: boolean
	banReason?: string
	scheduledDeletion?: Timestamp
}

export default function AdminPage() {
	const [users, setUsers] = useState<UserRow[]>([])
	const [loading, setLoading] = useState(false)
	const [banModal, setBanModal] = useState<{ open: boolean; userId?: string }>({ open: false })
	const [banReason, setBanReason] = useState('')
	const [banUntil, setBanUntil] = useState<string>('')
	const [deleteModal, setDeleteModal] = useState<{ open: boolean; userId?: string }>({ open: false })
	const [deletionAt, setDeletionAt] = useState<string>('')

	const fetchUsers = async () => {
		setLoading(true)
		try {
			const q = query(collection(db, 'users'), orderBy('name'))
			const snap = await getDocs(q)
			const rows: UserRow[] = []
			snap.forEach((d) => {
				const data = d.data() as any
				rows.push({
					id: d.id,
					name: data.name || 'Unnamed',
					email: data.email || '',
					status: data.status,
					lastSeen: data.lastSeen,
					device: data.device,
					banned: Boolean(data.banned),
					banReason: data.banReason,
					scheduledDeletion: data.scheduledDeletion,
				})
			})
			setUsers(rows)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { void fetchUsers() }, [])

	const handleBan = async () => {
		if (!banModal.userId) return
		const ref = doc(db, 'users', banModal.userId)
		await updateDoc(ref, {
			banned: true,
			banReason: banReason || 'Policy violation',
			banUntil: banUntil ? Timestamp.fromDate(new Date(banUntil)) : null,
		})
		setBanModal({ open: false })
		setBanReason('')
		setBanUntil('')
		void fetchUsers()
	}

	const handleScheduleDelete = async () => {
		if (!deleteModal.userId || !deletionAt) return
		const at = Timestamp.fromDate(new Date(deletionAt))
		const ref = doc(db, 'users', deleteModal.userId)
		await updateDoc(ref, { scheduledDeletion: at })
		setDeleteModal({ open: false })
		setDeletionAt('')
		void fetchUsers()
	}

	return (
		<div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Admin Dashboard</h1>
				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="capitalize">Admin</Badge>
					<Button variant="outline" size="sm" onClick={() => fetchUsers()} disabled={loading}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
				</div>
			</div>

			<Card className="mb-6 border-indigo-200/60 dark:border-indigo-800/60 shadow-sm">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="w-5 h-5" /> Users
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="text-left border-b">
									<th className="py-2 pr-4">Name</th>
									<th className="py-2 pr-4">Email</th>
									<th className="py-2 pr-4">Status</th>
									<th className="py-2 pr-4">Last Seen</th>
									<th className="py-2 pr-4">Device</th>
									<th className="py-2 pr-4">Actions</th>
								</tr>
							</thead>
							<tbody>
								{users.map(u => (
									<tr key={u.id} className="border-b last:border-b-0">
										<td className="py-2 pr-4">{u.name} {u.banned && <Badge className="ml-2 bg-red-600 text-white">Banned</Badge>}</td>
										<td className="py-2 pr-4">{u.email}</td>
										<td className="py-2 pr-4">
											<Badge className={u.status === 'online' ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}>
												{u.status || 'unknown'}
											</Badge>
										</td>
										<td className="py-2 pr-4">{u.lastSeen?.toDate?.().toLocaleString?.() || '-'}</td>
										<td className="py-2 pr-4">{u.device || '-'}</td>
										<td className="py-2 pr-4">
											<div className="flex gap-2">
												<Button variant="outline" size="sm" onClick={() => setBanModal({ open: true, userId: u.id })}>
													<Ban className="w-4 h-4 mr-1" /> Ban User
												</Button>
												<Button variant="outline" size="sm" onClick={() => setDeleteModal({ open: true, userId: u.id })}>
													<Clock className="w-4 h-4 mr-1" /> Delete (Schedule)
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Ban Modal */}
			<Dialog open={banModal.open} onOpenChange={(open) => setBanModal({ open })}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ban User</DialogTitle>
						<DialogDescription>Set a reason and optional end date. The user will be immediately blocked.</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<label className="text-sm font-medium">Reason</label>
						<Input value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="e.g., Policy violation" />
						<label className="text-sm font-medium">Ban Until (optional)</label>
						<Input type="datetime-local" value={banUntil} onChange={(e) => setBanUntil(e.target.value)} />
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setBanModal({ open: false })}>Cancel</Button>
						<Button onClick={handleBan}>Ban</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Schedule Delete Modal */}
			<Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open })}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Schedule Account Deletion</DialogTitle>
						<DialogDescription>Set a deletion time. The app will show a countdown and auto-delete when reached.</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<label className="text-sm font-medium">Delete At</label>
						<Input type="datetime-local" value={deletionAt} onChange={(e) => setDeletionAt(e.target.value)} />
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteModal({ open: false })}>Cancel</Button>
						<Button onClick={handleScheduleDelete} disabled={!deletionAt}>Schedule</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Card className="border-indigo-200/60 dark:border-indigo-800/60 shadow-sm">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="w-5 h-5" /> System Maintenance
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-sm text-muted-foreground">Backup and maintenance operations.</p>
					<div className="flex gap-2">
						<Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300"><RefreshCw className="w-4 h-4 mr-1" /> Sync Data</Button>
						<Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300">Export</Button>
						<Button size="sm" variant="destructive" className="bg-red-600 text-white hover:bg-red-700">Purge Test Data</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
} 