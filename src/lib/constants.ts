export const STORAGE_BUCKETS = {
  songs: 'songs',
  images: 'images',
} as const

export const ACCEPTED_AUDIO_TYPES = ['audio/mpeg'] as const

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

// Author/portfolio links surfaced in the app shell (sidebar footer + mobile footer).
// `email` is a mailto:; the rest are external https URLs opened in a new tab.
export const PORTFOLIO_LINKS = {
  github: 'https://github.com/SidVaidya2005/SpotifyAgain',
  linkedin: 'https://www.linkedin.com/in/siddarth-vaidya-885871239',
  email: 'mailto:siddarthvaidya2005@gmail.com',
  website: 'https://siddarthvaidya2005-7iyf.onrender.com',
} as const
