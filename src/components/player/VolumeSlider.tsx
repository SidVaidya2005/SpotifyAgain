'use client'

import * as Slider from '@radix-ui/react-slider'

interface VolumeSliderProps {
  value: number // 0..1
  onChange: (value: number) => void
}

// Presentational, fully controlled. The mute toggle (volume icon) lives in
// PlayerContent; this is just the level slider.
export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  return (
    <Slider.Root
      className="group relative flex h-4 w-24 touch-none select-none items-center"
      value={[value]}
      max={1}
      step={0.01}
      onValueChange={(v) => onChange(v[0])}
      aria-label="Volume"
    >
      <Slider.Track className="relative h-1 grow rounded-pill bg-surface-2">
        <Slider.Range className="absolute h-full rounded-pill bg-muted group-hover:bg-accent" />
      </Slider.Track>
      <Slider.Thumb className="block h-3 w-3 rounded-full bg-text opacity-0 shadow-card transition group-hover:opacity-100 focus:opacity-100 focus:outline-none" />
    </Slider.Root>
  )
}
