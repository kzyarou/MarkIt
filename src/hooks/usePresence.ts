import { useEffect, useRef } from 'react'
import { db } from '@/lib/firebase'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { cacheService } from '@/services/cacheService'

function getDeviceString(): string {
	if (typeof navigator === 'undefined') return 'Unknown Device'
	const ua = navigator.userAgent || ''
	const platform = (navigator as any).userAgentData?.platform || navigator.platform || ''
	let os = 'Unknown'
	if (/Windows/i.test(ua)) os = 'Windows'
	else if (/Android/i.test(ua)) os = 'Android'
	else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
	else if (/Mac OS X/i.test(ua)) os = 'macOS'
	else if (/Linux/i.test(ua)) os = 'Linux'
	const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edg|OPR)\/([\d.]+)/)
	const browser = browserMatch ? `${browserMatch[1]} ${browserMatch[2]}` : 'Browser'
	return `${os} - ${browser}`.trim()
}

export function usePresence() {
	const { user } = useAuth()
	const deviceRef = useRef<string>(getDeviceString())
	const lastUpdateRef = useRef<number>(0)
	const UPDATE_THROTTLE = 30000 // 30 seconds throttle

	useEffect(() => {
		if (!user?.id) return
		const userRef = doc(db, 'users', user.id)

		const setOnline = async () => {
			const now = Date.now()
			if (now - lastUpdateRef.current < UPDATE_THROTTLE) return
			
			try {
				await updateDoc(userRef, {
					status: 'online',
					lastSeen: serverTimestamp(),
					device: deviceRef.current,
				})
				lastUpdateRef.current = now
				
				// Invalidate user cache to reflect status change
				cacheService.invalidateUserData(user.id)
			} catch (e) {
				// ignore
			}
		}

		const setOffline = async () => {
			const now = Date.now()
			if (now - lastUpdateRef.current < UPDATE_THROTTLE) return
			
			try {
				await updateDoc(userRef, {
					status: 'offline',
					lastSeen: serverTimestamp(),
					device: deviceRef.current,
				})
				lastUpdateRef.current = now
				
				// Invalidate user cache to reflect status change
				cacheService.invalidateUserData(user.id)
			} catch (e) {
				// ignore
			}
		}

		// Initial mark online
		setOnline()

		const onVisibility = () => {
			if (document.visibilityState === 'visible') setOnline()
			else setOffline()
		}
		const onFocus = () => setOnline()
		const onBlur = () => setOffline()
		const onOnline = () => setOnline()
		const onOffline = () => setOffline()
		const onBeforeUnload = () => {
			// best-effort
			void setOffline()
		}

		document.addEventListener('visibilitychange', onVisibility)
		window.addEventListener('focus', onFocus)
		window.addEventListener('blur', onBlur)
		window.addEventListener('online', onOnline)
		window.addEventListener('offline', onOffline)
		window.addEventListener('beforeunload', onBeforeUnload)

		return () => {
			document.removeEventListener('visibilitychange', onVisibility)
			window.removeEventListener('focus', onFocus)
			window.removeEventListener('blur', onBlur)
			window.removeEventListener('online', onOnline)
			window.removeEventListener('offline', onOffline)
			window.removeEventListener('beforeunload', onBeforeUnload)
			// Mark offline when hook unmounts (e.g., logout)
			void setOffline()
		}
	}, [user?.id])
} 