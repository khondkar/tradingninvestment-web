"""
Shared TNI Research Open Graph visual identity.

Design rule:
    ~70% original research visualization
    ~20% research context
    ~10% TNI branding

The chart remains unique to each research asset.
This module owns the recurring TNI Research identity.
"""


def add_tni_research_identity(
    fig,
    *,
    navy="#07152f",
    muted="#667085",
    background="#ffffff",
):
    """
    Add the permanent TNI Research masthead and footer.

    Individual OG generators should own:
      - title
      - subtitle
      - descriptor
      - dynamic date/range
      - research visualization

    This helper owns:
      - TNI | RESEARCH
      - TRADINGNINVESTMENT
      - DATA / INTELLIGENCE / DECISIONS
      - branded footer
    """

    # --------------------------------------------------------
    # TOP-LEFT BRAND
    # --------------------------------------------------------

    fig.text(
        0.045,
        0.952,
        "TNI",
        fontsize=20,
        fontweight="bold",
        color=navy,
        verticalalignment="top",
    )

    fig.text(
        0.113,
        0.952,
        "|",
        fontsize=17,
        color=muted,
        verticalalignment="top",
    )

    fig.text(
        0.132,
        0.952,
        "RESEARCH",
        fontsize=12,
        fontweight="bold",
        color=navy,
        verticalalignment="top",
    )

    fig.text(
        0.046,
        0.900,
        "T R A D I N G N I N V E S T M E N T",
        fontsize=6.8,
        color=muted,
        verticalalignment="top",
    )

    # --------------------------------------------------------
    # TOP-RIGHT SIGNATURE
    # --------------------------------------------------------

    fig.text(
        0.955,
        0.952,
        "D A T A",
        fontsize=6.7,
        color=muted,
        horizontalalignment="right",
        verticalalignment="top",
    )

    fig.text(
        0.955,
        0.924,
        "I N T E L L I G E N C E",
        fontsize=6.7,
        color=muted,
        horizontalalignment="right",
        verticalalignment="top",
    )

    fig.text(
        0.955,
        0.896,
        "D E C I S I O N S",
        fontsize=6.7,
        color=muted,
        horizontalalignment="right",
        verticalalignment="top",
    )

    # --------------------------------------------------------
    # FOOTER
    # --------------------------------------------------------

    # Import locally so generators can import this helper
    # without introducing additional global dependencies.
    import matplotlib.pyplot as plt

    footer = plt.Rectangle(
        (0, 0),
        1,
        0.072,
        transform=fig.transFigure,
        facecolor=navy,
        edgecolor=navy,
        linewidth=0,
    )

    fig.patches.append(footer)

    fig.text(
        0.045,
        0.034,
        "T R A D I N G N I N V E S T M E N T . C O M",
        fontsize=6.5,
        fontweight="bold",
        color=background,
        verticalalignment="center",
    )

    fig.text(
        0.955,
        0.034,
        (
            "M A R K E T S   |   D A T A   |   "
            "R E S E A R C H   |   I N T E L L I G E N C E"
        ),
        fontsize=5.8,
        color=background,
        horizontalalignment="right",
        verticalalignment="center",
    )


def add_tni_research_header(
    fig,
    *,
    title,
    subtitle,
    descriptor,
    range_label=None,
    navy="#07152f",
    muted="#667085",
    accent="#0868a8",
):
    """
    Shared research-title geometry.

    Content remains generator-specific while placement and
    hierarchy stay consistent across TNI Research OG assets.
    """

    fig.text(
        0.045,
        0.825,
        title,
        fontsize=27,
        fontweight="bold",
        color=navy,
    )

    fig.text(
        0.045,
        0.762,
        subtitle,
        fontsize=17,
        fontweight="bold",
        color=accent,
    )

    fig.text(
        0.047,
        0.714,
        descriptor,
        fontsize=6.8,
        fontweight="bold",
        color=muted,
    )

    if range_label:
        fig.text(
            0.955,
            0.714,
            range_label,
            fontsize=7.5,
            fontweight="bold",
            color=muted,
            horizontalalignment="right",
        )


# Standard geometry available to every research generator.
TNI_RESEARCH_CHART_RECT = [
    0.055,
    0.125,
    0.90,
    0.535,
]
