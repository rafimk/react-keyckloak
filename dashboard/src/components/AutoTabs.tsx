import { useState } from 'react'
import type { ReactNode } from 'react'

export interface TabItem {
  id: string
  title: string
  content: ReactNode
}

interface AutoTabsProps {
  tabs: TabItem[]
  /** Time each tab stays visible before moving on, in ms. */
  interval?: number
}

/**
 * Tabs that advance to the next one on a timer. Hovering pauses rotation;
 * clicking a tab selects it and restarts the timer.
 */
export default function AutoTabs({ tabs, interval = 5000 }: AutoTabsProps) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const next = () => setActive((i) => (i + 1) % tabs.length)

  return (
    <div className="tabs" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="tab-list" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={i === active}
            className={'tab' + (i === active ? ' active' : '')}
            onClick={() => setActive(i)}
          >
            {tab.title}
            {i === active && (
              // The progress bar is the timer: when its animation ends we advance, so pausing it
              // on hover pauses rotation exactly. Keyed on `active` so it restarts for each tab.
              <span
                key={active}
                className="tab-progress"
                style={{ animationDuration: interval + 'ms', animationPlayState: paused ? 'paused' : 'running' }}
                onAnimationEnd={next}
              />
            )}
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel" key={tabs[active].id}>
        {tabs[active].content}
      </div>
    </div>
  )
}
