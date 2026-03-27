/** Layout constants used across the app shell */

export const SIDEBAR_WIDTH = "16rem"; // 256px — w-64
export const SIDEBAR_GAP = "0.75rem"; // 12px — left-3, top-3, bottom-3

/** Main content area left margin = sidebar width + gap on each side */
export const MAIN_MARGIN_LEFT = `calc(${SIDEBAR_WIDTH} + ${SIDEBAR_GAP} * 2)`;

/** App branding */
export const APP_NAME = "Eastman Colour Printers";
export const APP_SUBTITLE = "Quote Calculator";
