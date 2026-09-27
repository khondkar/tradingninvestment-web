type HistoricalPeriodSliderProps = {
  minYear: number
  maxYear: number
  startYear: number
  endYear: number
  currentYearIsYtd?: boolean
  onChange: (
    startYear: number,
    endYear: number,
  ) => void
}

export default function HistoricalPeriodSlider({
  minYear,
  maxYear,
  startYear,
  endYear,
  currentYearIsYtd = false,
  onChange,
}: HistoricalPeriodSliderProps) {
  const safeStart = Math.min(
    startYear,
    endYear,
  )

  const safeEnd = Math.max(
    startYear,
    endYear,
  )

  const span = Math.max(
    1,
    maxYear - minYear,
  )

  const startPct =
    ((safeStart - minYear) / span) *
    100

  const endPct =
    ((safeEnd - minYear) / span) *
    100

  const selectedWidth =
    endPct - startPct

  const startLabel =
    safeStart === maxYear &&
    currentYearIsYtd
      ? `${safeStart} YTD`
      : String(safeStart)

  const endLabel =
    safeEnd === maxYear &&
    currentYearIsYtd
      ? `${safeEnd} YTD`
      : String(safeEnd)

  function updateStart(
    nextStart: number,
  ) {
    onChange(
      Math.min(
        nextStart,
        safeEnd,
      ),
      safeEnd,
    )
  }

  function updateEnd(
    nextEnd: number,
  ) {
    onChange(
      safeStart,
      Math.max(
        nextEnd,
        safeStart,
      ),
    )
  }

  return (
    <section
      className="tni-period-slider"
      aria-labelledby="tni-period-slider-title"
    >
      <div className="tni-period-slider__heading">
        <div>
          <span
            id="tni-period-slider-title"
            className="tni-period-slider__eyebrow"
          >
            SELECT YEAR RANGE
          </span>

          <strong>
            {startLabel}
            {' — '}
            {endLabel}
          </strong>
        </div>

        <span className="tni-period-slider__hint">
          Drag either handle
        </span>
      </div>

      <div className="tni-period-slider__control">
        <div
          className="tni-period-slider__bubble tni-period-slider__bubble--start"
          style={{
            left: `${startPct}%`,
          }}
        >
          {startLabel}
        </div>

        <div
          className="tni-period-slider__bubble tni-period-slider__bubble--end"
          style={{
            left: `${endPct}%`,
          }}
        >
          {endLabel}
        </div>

        <div
          className="tni-period-slider__track"
          aria-hidden="true"
        >
          <div
            className="tni-period-slider__selection"
            style={{
              left: `${startPct}%`,
              width: `${selectedWidth}%`,
            }}
          />
        </div>

        <input
          className="tni-period-slider__input tni-period-slider__input--start"
          type="range"
          min={minYear}
          max={maxYear}
          step="1"
          value={safeStart}
          aria-label="Historical return start year"
          onChange={(event) =>
            updateStart(
              Number(
                event.target.value,
              ),
            )
          }
        />

        <input
          className="tni-period-slider__input tni-period-slider__input--end"
          type="range"
          min={minYear}
          max={maxYear}
          step="1"
          value={safeEnd}
          aria-label="Historical return end year"
          onChange={(event) =>
            updateEnd(
              Number(
                event.target.value,
              ),
            )
          }
        />
      </div>

      <div
        className="tni-period-slider__bounds"
        aria-hidden="true"
      >
        <span>{minYear}</span>

        <span>
          {maxYear}
          {currentYearIsYtd
            ? ' YTD'
            : ''}
        </span>
      </div>

      <div className="tni-period-slider__selects">
        <label>
          <span>FROM</span>

          <select
            value={safeStart}
            aria-label="Return start year"
            onChange={(event) =>
              updateStart(
                Number(
                  event.target.value,
                ),
              )
            }
          >
            {Array.from(
              {
                length:
                  maxYear -
                  minYear +
                  1,
              },
              (_, index) =>
                minYear +
                index,
            ).map(
              (year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ),
            )}
          </select>
        </label>

        <span
          className="tni-period-slider__arrow"
          aria-hidden="true"
        >
          →
        </span>

        <label>
          <span>TO</span>

          <select
            value={safeEnd}
            aria-label="Return end year"
            onChange={(event) =>
              updateEnd(
                Number(
                  event.target.value,
                ),
              )
            }
          >
            {Array.from(
              {
                length:
                  maxYear -
                  minYear +
                  1,
              },
              (_, index) =>
                minYear +
                index,
            ).map(
              (year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      <style>{`
        .tni-period-slider {
          margin-top: 18px;
          padding: 20px 20px 16px;
          border: 1px solid rgba(148, 163, 184, 0.28);
          border-radius: 16px;
          background:
            linear-gradient(
              180deg,
              rgba(253, 242, 248, 0.55),
              rgba(255, 255, 255, 0.96)
            );
        width: 100%;
        max-width: 100%;
        margin-left: 0;
        margin-right: 0;
        }

        .tni-period-slider__heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 38px;
        }

        .tni-period-slider__heading > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .tni-period-slider__eyebrow {
          color: #86198f;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.09em;
        }

        .tni-period-slider__heading strong {
          color: #172033;
          font-size: 1rem;
          line-height: 1.25;
        }

        .tni-period-slider__hint {
          color: #64748b;
          font-size: 0.78rem;
          white-space: nowrap;
        }

        .tni-period-slider__control {
          position: relative;
          height: 48px;
          margin: 0 8px;
        }

        .tni-period-slider__track {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 16px;
          transform: translateY(-50%);
          overflow: hidden;
          border-radius: 999px;
          background: #dbe2ea;
          box-shadow:
            inset 0 1px 3px rgba(15, 23, 42, 0.16);
        }

        .tni-period-slider__selection {
          position: absolute;
          top: 0;
          bottom: 0;
          border-radius: 999px;
          background:
            linear-gradient(
              90deg,
              #ec0aa8 0%,
              #d500c7 42%,
              #7c0bea 100%
            );
          box-shadow:
            0 0 14px rgba(217, 0, 199, 0.28);
          pointer-events: none;
        }

        .tni-period-slider__input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 48px;
          margin: 0;
          background: transparent;
          pointer-events: none;
          appearance: none;
          -webkit-appearance: none;
        }

        .tni-period-slider__input::-webkit-slider-runnable-track {
          height: 16px;
          background: transparent;
        }

        .tni-period-slider__input::-moz-range-track {
          height: 16px;
          background: transparent;
        }

        .tni-period-slider__input::-webkit-slider-thumb {
          width: 30px;
          height: 30px;
          margin-top: -9px;
          border: 3px solid #ffffff;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #f006b7,
              #7c0bea
            );
          box-shadow:
            0 2px 8px rgba(88, 28, 135, 0.35),
            0 0 0 2px rgba(217, 0, 199, 0.16);
          cursor: grab;
          pointer-events: auto;
          appearance: none;
          -webkit-appearance: none;
        }

        .tni-period-slider__input::-moz-range-thumb {
          width: 30px;
          height: 30px;
          border: 3px solid #ffffff;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #f006b7,
              #7c0bea
            );
          box-shadow:
            0 2px 8px rgba(88, 28, 135, 0.35),
            0 0 0 2px rgba(217, 0, 199, 0.16);
          cursor: grab;
          pointer-events: auto;
        }

        .tni-period-slider__input:focus {
          outline: none;
        }

        .tni-period-slider__input:focus-visible::-webkit-slider-thumb {
          outline: 3px solid rgba(217, 0, 199, 0.28);
          outline-offset: 3px;
        }

        .tni-period-slider__bubble {
          position: absolute;
          z-index: 4;
          top: -30px;
          transform: translateX(-50%);
          padding: 5px 9px;
          border-radius: 7px;
          background:
            linear-gradient(
              135deg,
              #ec0aa8,
              #7c0bea
            );
          color: #ffffff;
          font-size: 0.74rem;
          font-weight: 800;
          line-height: 1;
          white-space: nowrap;
          pointer-events: none;
          box-shadow:
            0 3px 9px rgba(126, 34, 206, 0.22);
        }

        .tni-period-slider__bubble::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -5px;
          width: 10px;
          height: 10px;
          transform:
            translateX(-50%)
            rotate(45deg);
          background: #a30be0;
        }

        .tni-period-slider__bounds {
          display: flex;
          justify-content: space-between;
          margin-top: 1px;
          color: #64748b;
          font-size: 0.74rem;
          font-weight: 650;
        }

        .tni-period-slider__selects {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 12px;
          margin-top: 14px;
        }

        .tni-period-slider__selects label {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .tni-period-slider__selects label > span {
          color: #64748b;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .tni-period-slider__selects select {
          min-width: 112px;
          min-height: 44px;
          padding: 8px 32px 8px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          background: #ffffff;
          color: #172033;
          font-size: 16px;
          font-weight: 650;
        }

        .tni-period-slider__arrow {
          padding-bottom: 12px;
          color: #a21caf;
          font-size: 1rem;
          font-weight: 800;
        }

        @media (max-width: 640px) {

        .tni-period-slider {
          width: 100%;
          max-width: 100%;
          margin-left: 0;
          margin-right: 0;
        }

          .tni-period-slider {
            margin-top: 14px;
            padding:
              18px
              14px
              14px;
            border-radius: 14px;
          }

          .tni-period-slider__heading {
            align-items: flex-start;
            margin-bottom: 42px;
          }

          .tni-period-slider__hint {
            display: none;
          }

          .tni-period-slider__control {
            height: 52px;
            margin: 0 5px;
          }

          .tni-period-slider__track {
            height: 16px;
          }

          .tni-period-slider__input {
            height: 52px;
          }

          .tni-period-slider__input::-webkit-slider-runnable-track {
            height: 16px;
          }

          .tni-period-slider__input::-moz-range-track {
            height: 16px;
          }

          .tni-period-slider__input::-webkit-slider-thumb {
            width: 32px;
            height: 32px;
            margin-top: -10px;
          }

          .tni-period-slider__input::-moz-range-thumb {
            width: 32px;
            height: 32px;
          }

          .tni-period-slider__bubble {
            top: -31px;
            padding: 6px 8px;
            font-size: 0.72rem;
          }

          .tni-period-slider__selects {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              auto
              minmax(0, 1fr);
            width: 100%;
            gap: 8px;
          }

          .tni-period-slider__selects label {
            min-width: 0;
          }

          .tni-period-slider__selects select {
            width: 100%;
            min-width: 0;
          }

          .tni-period-slider__heading strong {
            font-size: 0.94rem;
          }
        }

        @media (max-width: 360px) {
          .tni-period-slider {
            padding-left: 10px;
            padding-right: 10px;
          }

          .tni-period-slider__bubble {
            font-size: 0.67rem;
          }
        }
      `}</style>
    </section>
  )
}
