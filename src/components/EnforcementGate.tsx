import React, { useEffect, useMemo, useState } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function EnforcementGate() {
	const { user, logout, deleteUserProfile } = useAuth()
	const [banned, setBanned] = useState<boolean>(false)
	const [banReason, setBanReason] = useState<string>('')
	const [scheduledDeletion, setScheduledDeletion] = useState<number | null>(null)
	const [now, setNow] = useState<number>(Date.now())

	useEffect(() => {
		if (!user?.id) return
		const ref = doc(db, 'users', user.id)
		const unsub = onSnapshot(ref, (snap) => {
			const data = snap.data() as any
			setBanned(Boolean(data?.banned))
			setBanReason(data?.banReason || '')
			const ts = data?.scheduledDeletion
			if (ts?.toMillis) setScheduledDeletion(ts.toMillis())
			else if (typeof ts === 'number') setScheduledDeletion(ts)
			else setScheduledDeletion(null)
		})
		return () => unsub()
	}, [user?.id])

	// Tick for countdown
	useEffect(() => {
		const t = setInterval(() => setNow(Date.now()), 1000)
		return () => clearInterval(t)
	}, [])

	const deletionDue = useMemo(() => scheduledDeletion != null && now >= scheduledDeletion, [now, scheduledDeletion])
	const countdown = useMemo(() => {
		if (!scheduledDeletion) return ''
		const diff = Math.max(0, scheduledDeletion - now)
		const s = Math.floor(diff / 1000)
		const h = Math.floor(s / 3600)
		const m = Math.floor((s % 3600) / 60)
		const sec = s % 60
		return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`
	}, [now, scheduledDeletion])

	useEffect(() => {
		if (deletionDue) {
			// Best-effort client-side delete. Final authority should be Cloud Function.
			void deleteUserProfile()
		}
	}, [deletionDue, deleteUserProfile])

	return (
		<>
			<Dialog open={banned}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Access Restricted</DialogTitle>
						<DialogDescription>
							Your account has been banned{banReason ? `: ${banReason}` : ''}.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={logout}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={Boolean(scheduledDeletion) && !deletionDue}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Account Scheduled for Deletion</DialogTitle>
						<DialogDescription>
							Your account is scheduled for deletion. Time remaining: {countdown}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={logout}>Logout</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
} 