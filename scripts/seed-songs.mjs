// One-time local seed script: uploads the bundled demo catalog (Songs/public/*)
// to Supabase Storage and inserts the matching `songs` rows.
//
// Why .mjs (not .ts): the project has no TS runner (tsx/ts-node) and we don't want
// to add a dependency for a local admin task. Node's native --env-file loads
// .env.local. The architecture sanctions service-role SEED SCRIPTS run locally
// (never in app runtime).
//
// Run:  npm run seed:songs
//   (= node --env-file=.env.local scripts/seed-songs.mjs)
//
// Requires in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL          (already set for the app)
//   SUPABASE_SERVICE_ROLE_KEY         (secret — bypasses RLS so we can write as the owner)
//   SEED_USER_EMAIL                   (optional — defaults to the owner email below)
//
// Idempotent: skips any (title, author) the user already has, so re-running won't duplicate.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// --- config -----------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SEED_USER_EMAIL = process.env.SEED_USER_EMAIL ?? 'siddarthvaidya2005@gmail.com'

// Buckets — kept in sync with src/lib/constants.ts STORAGE_BUCKETS.
const BUCKETS = { songs: 'songs', images: 'images' }

// Repo-root/Songs/public holds the audio + covers; metadata mirrors Songs/seeds/songs.js.
const ASSETS_DIR = path.resolve(import.meta.dirname, '..', 'Songs', 'public')

// The 18 demo tracks (from Songs/seeds/songs.js). `n` is the shared file number for
// both Songs/public/songs/<n>.mp3 and Songs/public/cover-images/<n>.jpg.
//
// AUTHOR RELABEL for feature #20 ("more like this" / shuffle): the source data gives
// every track a unique artist, so same-author queueing would surface nothing. We group
// the three neon-themed tracks (5, 13, 17) under "Night Runners" to create one
// multi-song author to demo against. Everything else keeps its original artist.
const SONGS = [
  { n: 1, title: 'Stay With Me', author: 'Sarah Mitchell' },
  { n: 2, title: 'Midnight Drive', author: 'The Wanderers' },
  { n: 3, title: 'Lost in Tokyo', author: 'Electric Dreams' },
  { n: 4, title: 'Summer Daze', author: 'Coastal Kids' },
  { n: 5, title: 'Neon Lights', author: 'Night Runners' },
  { n: 6, title: 'Mountain High', author: 'The Wild Ones' },
  { n: 7, title: 'City Rain', author: 'Urban Echo' },
  { n: 8, title: 'Desert Wind', author: 'Sahara Sons' },
  { n: 9, title: 'Ocean Waves', author: 'Coastal Drift' },
  { n: 10, title: 'Starlight', author: 'Luna Bay' },
  { n: 11, title: 'Winter Dreams', author: 'Arctic Pulse' },
  { n: 12, title: 'Purple Sunset', author: 'Dream Valley' },
  { n: 13, title: 'Neon Dreams', author: 'Night Runners' }, // relabeled (was Cyber Pulse)
  { n: 14, title: 'Moonlight Dance', author: 'Silver Shadows' },
  { n: 15, title: 'Urban Jungle', author: 'City Lights' },
  { n: 16, title: 'Crystal Rain', author: 'Echo Valley' },
  { n: 17, title: 'Neon Tokyo', author: 'Night Runners' }, // relabeled (was Future Pulse)
  { n: 18, title: 'Midnight Blues', author: 'Jazz Cats' },
]

// --- helpers ----------------------------------------------------------------

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

/** Resolve the uploader's auth user id from their email via the admin API. */
async function resolveUserId(supabase, email) {
  // The owner is the only account, but page through to be safe rather than assume page 1.
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) fail(`Could not list auth users: ${error.message}`)
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (match) return match.id
    if (data.users.length < 200) break // last page
  }
  fail(
    `No auth user found for "${email}". Sign in to the app at least once with that ` +
      `Google account, or set SEED_USER_EMAIL in .env.local to the right address.`,
  )
}

// --- main -------------------------------------------------------------------

async function main() {
  if (!SUPABASE_URL) fail('NEXT_PUBLIC_SUPABASE_URL is not set (.env.local).')
  if (!SERVICE_ROLE_KEY) {
    fail(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local from ' +
        'Supabase → Project Settings → API → service_role (secret). It is gitignored.',
    )
  }

  // Admin client — service role bypasses RLS; never persist a session for a script.
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const userId = await resolveUserId(supabase, SEED_USER_EMAIL)
  console.log(`Seeding ${SONGS.length} songs as user ${userId} (${SEED_USER_EMAIL})\n`)

  // Idempotency: skip (title, author) pairs the user already has.
  const { data: existing, error: existingErr } = await supabase
    .from('songs')
    .select('title, author')
    .eq('user_id', userId)
  if (existingErr) fail(`Could not read existing songs: ${existingErr.message}`)
  const existingKeys = new Set((existing ?? []).map((s) => `${s.title}__${s.author}`))

  let created = 0
  let skipped = 0
  let failed = 0

  for (const song of SONGS) {
    const label = `"${song.title}" — ${song.author}`

    if (existingKeys.has(`${song.title}__${song.author}`)) {
      console.log(`↷ skip (already exists): ${label}`)
      skipped++
      continue
    }

    const uid = uuidv4()
    const songPath = `${userId}/${uid}.mp3`
    const imagePath = `${userId}/${uid}.jpg`
    const audioFile = path.join(ASSETS_DIR, 'songs', `${song.n}.mp3`)
    const coverFile = path.join(ASSETS_DIR, 'cover-images', `${song.n}.jpg`)

    try {
      const [audioBuf, coverBuf] = await Promise.all([readFile(audioFile), readFile(coverFile)])

      const up1 = await supabase.storage
        .from(BUCKETS.songs)
        .upload(songPath, audioBuf, { contentType: 'audio/mpeg', cacheControl: '3600', upsert: false })
      if (up1.error) throw new Error(`audio upload: ${up1.error.message}`)

      const up2 = await supabase.storage
        .from(BUCKETS.images)
        .upload(imagePath, coverBuf, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false })
      if (up2.error) {
        // clean up the orphaned audio before bailing (mirrors the app's upload cleanup invariant)
        await supabase.storage.from(BUCKETS.songs).remove([songPath])
        throw new Error(`cover upload: ${up2.error.message}`)
      }

      const ins = await supabase.from('songs').insert({
        user_id: userId,
        title: song.title,
        author: song.author,
        song_path: songPath,
        image_path: imagePath,
        is_public: true,
      })
      if (ins.error) {
        await supabase.storage.from(BUCKETS.songs).remove([songPath])
        await supabase.storage.from(BUCKETS.images).remove([imagePath])
        throw new Error(`row insert: ${ins.error.message}`)
      }

      console.log(`✔ created: ${label}`)
      created++
    } catch (err) {
      console.error(`✖ failed: ${label} — ${err instanceof Error ? err.message : String(err)}`)
      failed++
    }
  }

  console.log(`\nDone. created ${created}, skipped ${skipped}, failed ${failed}.`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)))
