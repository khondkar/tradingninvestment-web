import * as d3 from "d3";

import { tniChartTheme } from "./tniChartTheme";

import type {
  TNIHistoricalPriceChartConfig,
  TNIChartThemeOverrides,
} from "./tniChartTypes";

function resolveTheme(overrides?: TNIChartThemeOverrides) {
  return {
    colors: {
      ...tniChartTheme.colors,
      ...(overrides?.colors ?? {}),
    },
    typography: {
      ...tniChartTheme.typography,
    },
    spacing: {
      ...tniChartTheme.spacing,
    },
    chart: {
      ...tniChartTheme.chart,
      ...(overrides?.chart ?? {}),
    },
  };
}

function formatPrice(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function renderHistoricalPriceChart(
  container: HTMLElement,
  config: TNIHistoricalPriceChartConfig
): () => void {
  const theme = resolveTheme(config.themeOverrides);

  d3.select(container).selectAll("*").remove();

  const parseDate = d3.utcParse("%Y-%m-%d");

  const data = config.data
    .map((point) => ({
      ...point,
      parsedDate: parseDate(point.date),
    }))
    .filter(
      (
        point
      ): point is typeof point & {
        parsedDate: Date;
      } =>
        point.parsedDate instanceof Date &&
        Number.isFinite(point.close) &&
        point.close > 0
    )
    .sort(
      (a, b) =>
        a.parsedDate.getTime() -
        b.parsedDate.getTime()
    );

  if (data.length === 0) {
    container.textContent =
      "No verified historical price data available.";

    return () => {
      container.innerHTML = "";
    };
  }

  const containerWidth =
    container.clientWidth > 0
      ? container.clientWidth
      : 1000;

  const width = containerWidth;

  const viewportWidth =
    window.innerWidth;

  const isMobile =
    viewportWidth < 720 ||
    width < 720;

  const height =
    isMobile
      ? 460
      : config.height ?? 600;

  const margin =
    isMobile
      ? {
          top: 72,
          right: 16,
          bottom: 94,
          left: 62,
        }
      : {
          top: 78,
          right: 34,
          bottom: 76,
          left: 78,
        };

  const axisFontSize =
    isMobile
      ? 22
      : 15;

  const yearFontSize =
    isMobile
      ? 20
      : 15;

  const innerWidth =
    Math.max(
      0,
      width -
        margin.left -
        margin.right
    );

  const innerHeight =
    Math.max(
      0,
      height -
        margin.top -
        margin.bottom
    );

  container.style.position = "relative";
  container.style.fontFamily =
    theme.typography.fontFamily;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr(
      "viewBox",
      `0 0 ${width} ${height}`
    )
    .attr(
      "preserveAspectRatio",
      "xMidYMid meet"
    )
    .attr("role", "img")
    .attr(
      "aria-label",
      `${config.title}. ${config.subtitle ?? ""}`
    )
    .style("display", "block")
    .style(
      "background",
      theme.colors.background
    );

  svg
    .append("text")
    .attr("x", margin.left)
    .attr("y", 30)
    .attr(
      "fill",
      theme.colors.textPrimary
    )
    .attr(
      "font-size",
      isMobile
        ? 20
        : theme.typography.titleSize
    )
    .attr("font-weight", 700)
    .text(config.title);

  if (config.subtitle) {
    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", 53)
      .attr(
        "fill",
        theme.colors.textSecondary
      )
      .attr(
        "font-size",
        isMobile
          ? 12
          : theme.typography.subtitleSize
      )
      .text(config.subtitle);
  }

  const chart = svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left},${margin.top})`
    );

  const firstDate =
    data[0].parsedDate;

  const lastDate =
    data[data.length - 1].parsedDate;

  const xScale = d3
    .scaleUtc()
    .domain([
      firstDate,
      lastDate,
    ])
    .range([
      0,
      innerWidth,
    ]);

  const minPrice =
    d3.min(
      data,
      (point) => point.close
    ) ?? 1;

  const maxPrice =
    d3.max(
      data,
      (point) => point.close
    ) ?? 1;

  const yScale =
    config.useLogScale === false
      ? d3
          .scaleLinear()
          .domain([
            0,
            maxPrice * 1.06,
          ])
          .nice()
          .range([
            innerHeight,
            0,
          ])
      : d3
          .scaleLog()
          .domain([
            Math.max(
              1,
              minPrice * 0.85
            ),
            maxPrice * 1.08,
          ])
          .nice()
          .range([
            innerHeight,
            0,
          ]);

  const yTickCount =
    isMobile
      ? 4
      : 6;

  const yDomain =
    yScale.domain();

  const yMin =
    yDomain[0];

  const yMax =
    yDomain[1];

  const yTickValues =
    Array.from(
      {
        length: yTickCount,
      },
      (_, index) => {
        const ratio =
          index /
          (yTickCount - 1);

        return Math.exp(
          Math.log(yMin) +
            ratio *
              (
                Math.log(yMax) -
                Math.log(yMin)
              )
        );
      }
    );

  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(yTickValues)
    .tickSize(-innerWidth)
    .tickFormat(
      (value) =>
        d3.format("~s")(
          Number(value)
        )
    );

  const yAxisGroup =
    chart
      .append("g")
      .call(yAxis);

  yAxisGroup
    .select(".domain")
    .remove();

  yAxisGroup
    .selectAll(".tick line")
    .attr(
      "stroke",
      theme.colors.grid
    );

  yAxisGroup
    .selectAll(".tick text")
    .attr(
      "fill",
      theme.colors.textSecondary
    )
    .attr(
      "font-size",
      axisFontSize
    )
    .attr(
      "font-weight",
      isMobile
        ? 650
        : 600
    );

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(
      isMobile
        ? d3.utcYear.every(25)
        : d3.utcYear.every(10)
    )
    .tickFormat(
      (value) =>
        d3.utcFormat("%Y")(
          value as Date
        )
    )
    .tickSizeOuter(0);

  const xAxisGroup =
    chart
      .append("g")
      .attr(
        "transform",
        `translate(0,${innerHeight})`
      )
      .call(xAxis);

  xAxisGroup
    .select(".domain")
    .attr(
      "stroke",
      theme.colors.border
    );

  xAxisGroup
    .selectAll(".tick line")
    .attr(
      "stroke",
      theme.colors.border
    );

  xAxisGroup
    .selectAll(".tick text")
    .attr(
      "fill",
      theme.colors.textSecondary
    )
    .attr(
      "font-size",
      yearFontSize
    )
    .attr(
      "font-weight",
      isMobile
        ? 650
        : 600
    );

  const line = d3
    .line<(typeof data)[number]>()
    .x(
      (point) =>
        xScale(point.parsedDate)
    )
    .y(
      (point) =>
        yScale(point.close)
    )
    .curve(d3.curveMonotoneX);

  chart
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr(
      "stroke",
      theme.colors.accent
    )
    .attr("stroke-width", 2.25)
    .attr(
      "stroke-linejoin",
      "round"
    )
    .attr(
      "stroke-linecap",
      "round"
    )
    .attr("d", line);

  const tooltip = d3
    .select(container)
    .append("div")
    .style(
      "position",
      "absolute"
    )
    .style(
      "pointer-events",
      "none"
    )
    .style("opacity", "0")
    .style("z-index", "20")
    .style(
      "padding",
      "10px 12px"
    )
    .style(
      "border-radius",
      "8px"
    )
    .style(
      "background",
      theme.colors.tooltipBackground
    )
    .style(
      "color",
      theme.colors.tooltipText
    )
    .style(
      "font-size",
      `${theme.typography.tooltipSize}px`
    )
    .style(
      "line-height",
      "1.4"
    )
    .style(
      "box-shadow",
      "0 8px 24px rgba(0,0,0,.14)"
    );

  // ==========================================================
  // HISTORICAL EVENT ANNOTATIONS
  // Desktop: all supplied events
  // Mobile: 1929, 1987, 2009, 2020 only
  // ==========================================================

  const mobileAnnotationYears =
    new Set([
      1929,
      1987,
      2009,
      2020,
    ]);

  const visibleAnnotations =
    (config.annotations ?? [])
      .map((annotation) => ({
        ...annotation,
        parsedDate:
          parseDate(annotation.date),
      }))
      .filter(
        (annotation) =>
          annotation.parsedDate instanceof Date &&
          Number.isFinite(annotation.price) &&
          (annotation.price ?? 0) > 0 &&
          (
            !isMobile ||
            mobileAnnotationYears.has(
              annotation.parsedDate.getUTCFullYear()
            )
          )
      );

  function showAnnotation(
    event: PointerEvent,
    annotation: (typeof visibleAnnotations)[number]
  ) {
    if (
      !(annotation.parsedDate instanceof Date) ||
      annotation.price === undefined
    ) {
      return;
    }

    const x =
      xScale(annotation.parsedDate);

    const y =
      yScale(annotation.price);

    const dateLabel =
      d3.utcFormat("%b %d, %Y")(
        annotation.parsedDate
      );

    const declineLine =
      annotation.declinePct !== undefined
        ? `<div style="margin-top:3px">Decline: ${annotation.declinePct.toFixed(1)}%</div>`
        : "";

    const noteLine =
      annotation.note
        ? `<div style="margin-top:5px;max-width:260px">${annotation.note}</div>`
        : "";

    tooltip
      .html(
        `
          <div style="font-weight:700">
            ${annotation.title}
          </div>
          <div style="margin-top:3px">
            ${dateLabel}
          </div>
          <div style="margin-top:3px">
            Dow: ${formatPrice(annotation.price)}
          </div>
          ${declineLine}
          ${noteLine}
        `
      )
      .style("opacity", "1");

    const tooltipNode =
      tooltip.node();

    const tooltipWidth =
      tooltipNode?.offsetWidth ??
      190;

    const left =
      Math.min(
        Math.max(
          8,
          margin.left + x + 14
        ),
        width -
          tooltipWidth -
          8
      );

    const top =
      Math.max(
        8,
        margin.top + y - 72
      );

    tooltip
      .style(
        "left",
        `${left}px`
      )
      .style(
        "top",
        `${top}px`
      );

    event.stopPropagation();
  }

  const annotationLayer =
    chart
      .append("g")
      .attr(
        "aria-label",
        "Historical market events"
      );

  const annotationRed =
    "#991B1B";

  const annotationGroups =
    annotationLayer
      .selectAll<SVGGElement, (typeof visibleAnnotations)[number]>(
        "g.event-annotation"
      )
      .data(visibleAnnotations)
      .join("g")
      .attr(
        "class",
        "event-annotation"
      )
      .style(
        "cursor",
        "pointer"
      );

  annotationGroups.each(function (
    annotation,
    index
  ) {
    if (
      !(annotation.parsedDate instanceof Date) ||
      annotation.price === undefined
    ) {
      return;
    }

    const group =
      d3.select(this);

    const x =
      xScale(annotation.parsedDate);

    const y =
      yScale(annotation.price);

    // Large invisible mobile touch target.
    // Makes the event easy to tap without adding visual clutter.
    if (isMobile) {
      group
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 18)
        .attr("fill", "transparent")
        .style("pointer-events", "all");
    }

    // Visible deep-red event marker.
    group
      .append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr(
        "r",
        isMobile
          ? 6
          : 5.5
      )
      .attr(
        "fill",
        annotationRed
      )
      .attr(
        "stroke",
        "#FFFFFF"
      )
      .attr(
        "stroke-width",
        2
      )
      .style(
        "pointer-events",
        "none"
      );

    if (isMobile) {
      const boxWidth =
        Math.min(
          190,
          innerWidth - 16
        );

      const boxHeight =
        68;

      const headerHeight =
        24;

      let boxX =
        x - boxWidth / 2;

      boxX =
        Math.max(
          8,
          Math.min(
            innerWidth - boxWidth - 8,
            boxX
          )
        );

      let boxY =
        y - boxHeight - 22;

      if (boxY < 8) {
        boxY =
          Math.min(
            innerHeight - boxHeight - 8,
            y + 22
          );
      }

      const mobileCard =
        group
          .append("g")
          .attr(
            "class",
            "mobile-annotation-card"
          )
          .style(
            "display",
            "none"
          )
          .style(
            "pointer-events",
            "none"
          );

      mobileCard
        .append("line")
        .attr("x1", x)
        .attr("y1", y)
        .attr(
          "x2",
          Math.max(
            boxX + 12,
            Math.min(
              boxX + boxWidth - 12,
              x
            )
          )
        )
        .attr(
          "y2",
          boxY > y
            ? boxY
            : boxY + boxHeight
        )
        .attr(
          "stroke",
          annotationRed
        )
        .attr(
          "stroke-width",
          1.5
        );

      mobileCard
        .append("rect")
        .attr("x", boxX)
        .attr("y", boxY)
        .attr(
          "width",
          boxWidth
        )
        .attr(
          "height",
          boxHeight
        )
        .attr("rx", 5)
        .attr(
          "fill",
          "#FFFFFF"
        )
        .attr(
          "stroke",
          annotationRed
        )
        .attr(
          "stroke-width",
          1.5
        );

      mobileCard
        .append("rect")
        .attr("x", boxX)
        .attr("y", boxY)
        .attr(
          "width",
          boxWidth
        )
        .attr(
          "height",
          headerHeight
        )
        .attr("rx", 5)
        .attr(
          "fill",
          annotationRed
        );

      mobileCard
        .append("text")
        .attr(
          "x",
          boxX + 8
        )
        .attr(
          "y",
          boxY + 16
        )
        .attr(
          "fill",
          "#FFFFFF"
        )
        .attr(
          "font-size",
          11
        )
        .attr(
          "font-weight",
          700
        )
        .text(
          annotation.title
        );

      mobileCard
        .append("text")
        .attr(
          "x",
          boxX + 8
        )
        .attr(
          "y",
          boxY + 42
        )
        .attr(
          "fill",
          theme.colors.textPrimary
        )
        .attr(
          "font-size",
          11
        )
        .attr(
          "font-weight",
          600
        )
        .text(
          d3.utcFormat("%b %d, %Y")(
            annotation.parsedDate
          )
        );

      mobileCard
        .append("text")
        .attr(
          "x",
          boxX + 8
        )
        .attr(
          "y",
          boxY + 59
        )
        .attr(
          "fill",
          theme.colors.textPrimary
        )
        .attr(
          "font-size",
          11
        )
        .text(
          `Dow: ${formatPrice(annotation.price)}`
        );
    }

    if (!isMobile) {
      const boxWidth =
        150;

      const boxHeight =
        62;

      const headerHeight =
        22;

      // Alternate callouts above/below to reduce collisions.
      const placeBelow =
        index % 2 === 1;

      const annotationYear =
        annotation.parsedDate.getUTCFullYear();

      const horizontalOffset =
        annotationYear === 2009
          ? -115
          : 0;

      let boxX =
        x -
        boxWidth / 2 +
        horizontalOffset;

      let boxY =
        placeBelow
          ? y + 22
          : y - boxHeight - 22;

      boxX =
        Math.max(
          4,
          Math.min(
            innerWidth - boxWidth - 4,
            boxX
          )
        );

      boxY =
        Math.max(
          4,
          Math.min(
            innerHeight - boxHeight - 4,
            boxY
          )
        );

      const connectorY =
        placeBelow
          ? boxY
          : boxY + boxHeight;

      group
        .append("line")
        .attr("x1", x)
        .attr("y1", y)
        .attr(
          "x2",
          Math.max(
            boxX + 12,
            Math.min(
              boxX + boxWidth - 12,
              x
            )
          )
        )
        .attr(
          "y2",
          connectorY
        )
        .attr(
          "stroke",
          annotationRed
        )
        .attr(
          "stroke-width",
          1.2
        );

      group
        .append("rect")
        .attr("x", boxX)
        .attr("y", boxY)
        .attr(
          "width",
          boxWidth
        )
        .attr(
          "height",
          boxHeight
        )
        .attr(
          "rx",
          5
        )
        .attr(
          "fill",
          "#FFFFFF"
        )
        .attr(
          "stroke",
          annotationRed
        )
        .attr(
          "stroke-width",
          1.2
        );

      group
        .append("path")
        .attr(
          "d",
          `
            M ${boxX + 5} ${boxY}
            H ${boxX + boxWidth - 5}
            Q ${boxX + boxWidth} ${boxY}
              ${boxX + boxWidth} ${boxY + 5}
            V ${boxY + headerHeight}
            H ${boxX}
            V ${boxY + 5}
            Q ${boxX} ${boxY}
              ${boxX + 5} ${boxY}
            Z
          `
        )
        .attr(
          "fill",
          annotationRed
        );

      group
        .append("text")
        .attr(
          "x",
          boxX + 8
        )
        .attr(
          "y",
          boxY + 15
        )
        .attr(
          "fill",
          "#FFFFFF"
        )
        .attr(
          "font-size",
          11
        )
        .attr(
          "font-weight",
          700
        )
        .text(
          annotation.title
        );

      group
        .append("text")
        .attr(
          "x",
          boxX + 8
        )
        .attr(
          "y",
          boxY + 38
        )
        .attr(
          "fill",
          theme.colors.textPrimary
        )
        .attr(
          "font-size",
          10.5
        )
        .attr(
          "font-weight",
          600
        )
        .text(
          d3.utcFormat("%b %d, %Y")(
            annotation.parsedDate
          )
        );

      group
        .append("text")
        .attr(
          "x",
          boxX + 8
        )
        .attr(
          "y",
          boxY + 54
        )
        .attr(
          "fill",
          theme.colors.textPrimary
        )
        .attr(
          "font-size",
          10.5
        )
        .text(
          `Dow: ${formatPrice(annotation.price)}`
        );
    }
  });

  annotationGroups
    .on(
      "pointerenter",
      function (
        event,
        annotation
      ) {
        if (!isMobile) {
          showAnnotation(
            event as PointerEvent,
            annotation
          );
        }
      }
    )
    .on(
      "pointerdown",
      function (
        event,
        annotation
      ) {
        event.preventDefault();
        event.stopPropagation();

        if (isMobile) {
          annotationLayer
            .selectAll(
              ".mobile-annotation-card"
            )
            .style(
              "display",
              "none"
            );

          const selectedAnnotation =
            d3.select(this);

          selectedAnnotation
            .raise();

          selectedAnnotation
            .select(
              ".mobile-annotation-card"
            )
            .style(
              "display",
              null
            );

          tooltip
            .style(
              "opacity",
              "0"
            );

          return;
        }

        showAnnotation(
          event as PointerEvent,
          annotation
        );
      }
    )
    .on(
      "click",
      function (
        event,
        annotation
      ) {
        event.preventDefault();
        event.stopPropagation();

        if (!isMobile) {
          showAnnotation(
            event as PointerEvent,
            annotation
          );
        }
      }
    );

  const crosshair = chart
    .append("line")
    .attr("y1", 0)
    .attr("y2", innerHeight)
    .attr(
      "stroke",
      theme.colors.zeroLine
    )
    .attr(
      "stroke-dasharray",
      "4 4"
    )
    .style("opacity", 0);

  const focusDot = chart
    .append("circle")
    .attr("r", 4.5)
    .attr(
      "fill",
      theme.colors.accent
    )
    .attr(
      "stroke",
      theme.colors.background
    )
    .attr("stroke-width", 2)
    .style("opacity", 0);

  const bisectDate = d3.bisector(
    (
      point: (typeof data)[number]
    ) => point.parsedDate
  ).center;

  function showPoint(
    event: PointerEvent
  ) {
    const [
      pointerX,
    ] = d3.pointer(
      event,
      chart.node()
    );

    const targetDate =
      xScale.invert(
        Math.max(
          0,
          Math.min(
            innerWidth,
            pointerX
          )
        )
      );

    const index =
      bisectDate(
        data,
        targetDate
      );

    const point =
      data[
        Math.max(
          0,
          Math.min(
            data.length - 1,
            index
          )
        )
      ];

    const x =
      xScale(
        point.parsedDate
      );

    const y =
      yScale(
        point.close
      );

    crosshair
      .attr("x1", x)
      .attr("x2", x)
      .style("opacity", 1);

    focusDot
      .attr("cx", x)
      .attr("cy", y)
      .style("opacity", 1);

    const dateLabel =
      point.frequency === "annual"
        ? d3.utcFormat("%Y")(
            point.parsedDate
          )
        : d3.utcFormat(
            "%b %Y"
          )(
            point.parsedDate
          );

    tooltip
      .html(
        `
          <div style="font-weight:700">
            ${dateLabel}
          </div>
          <div style="margin-top:2px">
            ${config.metricLabel}: ${formatPrice(point.close)}
          </div>
        `
      )
      .style("opacity", "1");

    const bounds =
      container.getBoundingClientRect();

    const tooltipNode =
      tooltip.node();

    const tooltipWidth =
      tooltipNode?.offsetWidth ??
      150;

    const screenX =
      margin.left + x;

    const left =
      Math.min(
        Math.max(
          8,
          screenX + 14
        ),
        width -
          tooltipWidth -
          8
      );

    const top =
      Math.max(
        8,
        margin.top +
          y -
          58
      );

    tooltip
      .style(
        "left",
        `${left}px`
      )
      .style(
        "top",
        `${top}px`
      );

    void bounds;
  }

  const interactionLayer =
    chart
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .style(
        "touch-action",
        "pan-y"
      );

  // Keep historical event dots/cards above the transparent
  // chart interaction layer so mobile taps reach the annotations.
  annotationLayer.raise();

  interactionLayer
    .on(
      "pointermove",
      function (event) {
        showPoint(
          event as PointerEvent
        );
      }
    )
    .on(
      "pointerdown",
      function (event) {
        showPoint(
          event as PointerEvent
        );
      }
    )
    .on(
      "pointerleave",
      function (event) {
        if (
          (event as PointerEvent)
            .pointerType === "mouse"
        ) {
          crosshair
            .style(
              "opacity",
              0
            );

          focusDot
            .style(
              "opacity",
              0
            );

          tooltip
            .style(
              "opacity",
              "0"
            );
        }
      }
    );

  if (
    config.showWatermark !== false
  ) {
    svg
      .append("text")
      .attr(
        "x",
        width - margin.right
      )
      .attr(
        "y",
        height - 14
      )
      .attr(
        "text-anchor",
        "end"
      )
      .attr(
        "fill",
        theme.colors.watermark
      )
      .attr(
        "font-size",
        isMobile
          ? 13
          : theme.typography.watermarkSize
      )
      .attr(
        "font-weight",
        700
      )
      .text(
        config.branding.watermarkText
      );
  }

  if (
    config.showSource !== false &&
    config.branding.sourceLabel
  ) {
    svg
      .append("text")
      .attr(
        "x",
        margin.left
      )
      .attr(
        "y",
        height - 14
      )
      .attr(
        "fill",
        theme.colors.textSecondary
      )
      .attr(
        "font-size",
        isMobile ? 10 : 12
      )
      .attr(
        "font-weight",
        500
      )
      .text(
        `Source: ${config.branding.sourceLabel}`
      );
  }

  return () => {
    tooltip.remove();
    svg.remove();
  };
}
