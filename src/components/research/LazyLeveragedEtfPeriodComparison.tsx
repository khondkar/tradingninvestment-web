import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  PeriodDataset,
} from './LeveragedEtfPeriodComparison'

type LoadedComparison = {
  Component: React.ComponentType<{
    dataset: PeriodDataset
  }>
  dataset: PeriodDataset
}

export default function LazyLeveragedEtfPeriodComparison() {
  const containerRef =
    useRef<HTMLDivElement | null>(null)

  const [loaded, setLoaded] =
    useState<LoadedComparison | null>(null)

  useEffect(() => {
    const container =
      containerRef.current

    if (!container) {
      return
    }

    let cancelled = false

    const load = async () => {
      const [
        componentModule,
        dataModule,
      ] = await Promise.all([
        import('./LeveragedEtfPeriodComparison'),
        import(
          '../../data/charts/tqqqVsQqqPeriodReturns.json'
        ),
      ])

      if (cancelled) {
        return
      }

      setLoaded({
        Component: componentModule.default,
        dataset:
          dataModule.default as PeriodDataset,
      })
    }

    if (
      typeof IntersectionObserver ===
      'undefined'
    ) {
      void load()
      return
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries.some(
              (entry) =>
                entry.isIntersecting,
            )
          ) {
            observer.disconnect()
            void load()
          }
        },
        {
          rootMargin: '700px 0px',
        },
      )

    observer.observe(container)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [])

  const Comparison =
    loaded?.Component

  return (
    <div ref={containerRef}>
      {Comparison && loaded ? (
        <Suspense
          fallback={
            <LoadingComparison />
          }
        >
          <Comparison
            dataset={loaded.dataset}
          />
        </Suspense>
      ) : (
        <div
          style={{
            minHeight: '120px',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

function LoadingComparison() {
  return (
    <section
      style={{
        minHeight: '260px',
        marginBottom: '34px',
        padding: '22px',
        border: '1px solid #e4ebf3',
        borderRadius: '14px',
        background: '#ffffff',
      }}
      aria-label="Loading TQQQ and QQQ period comparison"
    >
      <div
        style={{
          color: '#1677ff',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Benchmark Comparison
      </div>

      <h2
        style={{
          margin: '6px 0 8px',
          color: '#10233f',
          fontSize: '24px',
        }}
      >
        TQQQ vs. QQQ Returns
      </h2>

      <p
        style={{
          color: '#6b7b90',
          fontSize: '13px',
        }}
      >
        Loading period comparison…
      </p>
    </section>
  )
}
