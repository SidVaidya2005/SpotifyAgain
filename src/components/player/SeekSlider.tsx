'use client'

import * as Slider from '@radix-ui/react-slider'

interface SeekSliderProps {
  value: number // current position in seconds
  max: number // track duration in seconds
  onChange: (value: number) => void
}

// Presentational, fully controlled. Spotify-style: muted progress that turns
// accent on hover, thumb revealed on hover. Position state + scrubbing logic
// live in PlayerContent.
export function SeekSlider({ value, max, onChange }: SeekSliderProps) {
  return (
    <Slider.Root
      className="group relative flex h-4 w-full touch-none select-none items-center"
      value={[value]}
      max={max || 1}
      step={1}
      onValueChange={(v) => onChange(v[0])}
      aria-label="Seek"
    >
      <Slider.Track className="relative h-1 grow rounded-pill bg-surface-2">
        <Slider.Range className="absolute h-full rounded-pill bg-muted group-hover:bg-accent" />
      </Slider.Track>
      <Slider.Thumb className="block h-3 w-3 rounded-full bg-text opacity-0 shadow-card transition group-hover:opacity-100 focus:opacity-100 focus:outline-none" />
    </Slider.Root>
  )
}
