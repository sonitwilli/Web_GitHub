import { PREVIOUS_USER_ID } from '@/lib/constant/texts'

interface User {
  user_id_str?: string
}

declare global {
  interface Window {
    clevertap?: {
      clear?: () => Promise<void> | void
    }
  }
}

export const checkCTapID = async (): Promise<void> => {
  try {
    const userString = localStorage.getItem('user')
    const nextUser: User = userString ? JSON.parse(userString) : {}

    const previousUserId = localStorage.getItem(PREVIOUS_USER_ID)

    if (previousUserId && previousUserId !== nextUser.user_id_str) {
      // reset clevertap
      if (window.clevertap?.clear) {
        await window.clevertap.clear()
      }
    }

    if (nextUser.user_id_str) {
      localStorage.setItem(PREVIOUS_USER_ID, nextUser.user_id_str)
    }
  } catch (error) {
    console.error('checkCTapID error:', error)
  }
}
