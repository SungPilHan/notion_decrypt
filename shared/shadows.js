"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeShadows = void 0;
const chroma_js_1 = __importDefault(require("chroma-js"));
const brown = (alpha = 1) => `rgba(84, 70, 35, ${alpha})`;
const shadows = {
    frontDesktopChromeHairline: `rgba(255, 255, 255, 0.5) 0px 0px 0px 1px`,
    frontMediumShadow: `0 2px 8px ${brown(0.15)}, 0 1px 3px ${brown(0.15)}`,
    frontDeepShadow: `0 6px 20px ${brown(0.3)}`,
    frontInputShadow: "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px inset",
    frontImageFilterDropShadow: "drop-shadow(rgba(84, 70, 35, 0.3) 0px 6px 20px)",
    frontImageSmallFilterDropShadow: "drop-shadow(rgba(84, 70, 35, 0.3) 0px 3px 10px)",
    frontCardShadow: `
		0px 4px 8px rgba(0, 0, 0, 0.04),
		0px 0px 2px rgba(0, 0, 0, 0.06),
		0px 0px 1px rgba(0, 0, 0, 0.04)
	`,
    frontDialogShadow: getShadow({
        elevation: 5,
        color: (0, chroma_js_1.default)("rgb(15, 15, 15)"),
        opacity: 0.1,
    }),
};
exports.default = shadows;
const grayscale = {
    light: (0, chroma_js_1.default)("rgb(15, 15, 15)"),
    dark: (0, chroma_js_1.default)("rgb(15, 15, 15)"),
};
exports.themeShadows = {
    shadowColor: { light: grayscale.light, dark: grayscale.dark },
    shadowOpacity: { light: 0.1, dark: 0.2 },
    lightBoxShadow: {
        light: getShadow({
            elevation: 2,
            color: grayscale.light,
            opacity: 0.1,
        }),
        dark: getShadow({
            elevation: 2,
            color: grayscale.dark,
            opacity: 0.2,
        }),
    },
    buttonGroupShadow: {
        light: getShadow({
            elevation: 2,
            color: grayscale.light,
            opacity: 0.1,
        }),
        dark: getShadow({
            elevation: 1,
            color: (0, chroma_js_1.default)("rgb(255,255,255)"),
            opacity: 0.13,
        }),
    },
    mediumBoxShadow: {
        light: getShadow({
            elevation: 3,
            color: grayscale.light,
            opacity: 0.1,
        }),
        dark: getShadow({
            elevation: 3,
            color: grayscale.dark,
            opacity: 0.2,
        }),
    },
    selectTypeBoardBoxShadow: {
        light: getShadow({
            elevation: 2,
            color: grayscale.light,
            opacity: 0.05,
        }),
        dark: getShadow({
            elevation: 2,
            color: grayscale.dark,
            opacity: 0.1,
        }),
    },
    upCaretDropShadow: {
        light: "drop-shadow(rgba(15, 15, 15, 0.1) 0px 1px 0px)",
        dark: "drop-shadow(rgba(15, 15, 15, 0.2) 0px 1px 0px)",
    },
    downCaretDropShadow: {
        light: "drop-shadow(0px 4px 2px rgba(15, 15, 15, 0.1))",
        dark: "drop-shadow(0px 4px 2px rgba(15, 15, 15, 0.2))",
    },
    horizontalCaretDropShadow: {
        light: "drop-shadow(rgba(15, 15, 15, 0.1) -2px 0px 1px)",
        dark: "drop-shadow(rgba(15, 15, 15, 0.1) -2px 0px 1px)",
    },
    bottomActionBarShadow: {
        light: `0 -1px 0 1px ${grayscale.light
            .alpha(0.05)
            .css()}, 0 -3px 6px ${grayscale.light.alpha(0.1).css()}`,
        dark: `0 -1px 0 1px ${grayscale.dark
            .alpha(0.05)
            .css()}, 0 -3px 6px ${grayscale.light.alpha(0.1).css()}`,
    },
    largeBoxShadow: {
        light: getShadow({
            elevation: 5,
            color: grayscale.light,
            opacity: 0.1,
        }),
        dark: getShadow({
            elevation: 5,
            color: grayscale.dark,
            opacity: 0.2,
        }),
    },
    largeLightBoxShadow: {
        light: getShadow({
            elevation: 3,
            color: grayscale.light,
            opacity: 0.03,
        }),
        dark: getShadow({
            elevation: 3,
            color: grayscale.dark,
            opacity: 0.1,
        }),
    },
    buttonBoxShadow: {
        light: `inset 0 0 0 1px ${grayscale.light
            .alpha(0.1)
            .css()}, 0 1px 2px ${grayscale.light.alpha(0.1).css()}`,
        dark: `inset 0 0 0 1px ${grayscale.dark
            .alpha(0.2)
            .css()}, 0 1px 2px ${grayscale.dark.alpha(0.1).css()}`,
    },
    timelineTableBoxShadow: {
        light: `0 0 8px 0 ${grayscale.light.alpha(0.03).css()}`,
        dark: `0 0 8px 0 ${grayscale.dark.alpha(0.03).css()}`,
    },
    plainButtonBoxShadow: {
        light: `0 0 0 1px ${grayscale.light.alpha(0.1).css()}`,
        dark: `0 0 0 1px rgba(255,255,255,0.1)`,
    },
    elevatedButtonBoxShadow: {
        light: `inset 0 0 0 1px ${grayscale.light
            .alpha(0.15)
            .css()}, 0 2px 4px ${grayscale.light.alpha(0.07).css()}`,
        dark: `inset 0 0 0 1px ${grayscale.dark
            .alpha(0.2)
            .css()}, 0 2px 4px ${grayscale.dark.alpha(0.1).css()}`,
    },
    borderBoxShadow: {
        light: `0 0 0 1px ${grayscale.light.alpha(0.1).css()}`,
        dark: `0 0 0 1px ${grayscale.dark.alpha(0.2).css()}`,
    },
    innerBorderBoxShadow: {
        light: `inset 0 0 0 1px ${grayscale.light.alpha(0.1).css()}`,
        dark: `inset 0 0 0 1px "rgba(255, 255, 255, 0.055)"`,
    },
    avatarBoxShadow: {
        light: `0 2px 4px rgba(15, 15, 15, 0.1)`,
        dark: `0 2px 4px rgba(15, 15, 15, 0.2)`,
    },
    inputBoxShadow: {
        light: getShadow({
            elevation: 1,
            color: grayscale.light,
            opacity: 0.1,
            inner: true,
        }),
        dark: getShadow({
            elevation: 1,
            color: grayscale.dark,
            opacity: 0.2,
            inner: true,
        }),
    },
    outlineRedInputBoxShadow: {
        light: `
			rgba(235, 87, 87, 0.7) 0px 0px 0px 1px inset,
			rgba(235, 87, 87, 0.4) 0px 0px 0px 2px
		`,
        dark: `
			rgba(235, 87, 87, 0.7) 0px 0px 0px 1px inset,
			rgba(235, 87, 87, 0.4) 0px 0px 0px 2px
		`,
    },
    outlineBlueInputBoxShadow: {
        light: `
			rgba(35, 131, 226, 0.57) 0px 0px 0px 1px inset,
			rgba(35, 131, 226, 0.35) 0px 0px 0px 2px
	  `,
        dark: `
		rgba(35, 131, 226, 0.57) 0px 0px 0px 1px inset,
		rgba(35, 131, 226, 0.35) 0px 0px 0px 2px
	  `,
    },
    outlineThinBlueInputBoxShadow: {
        light: `
			rgba(35, 131, 226, 0.57) 0px 0px 0px 1px inset,
			rgba(35, 131, 226, 0.35) 0px 0px 0px 1px
	  `,
        dark: `
		rgba(35, 131, 226, 0.57) 0px 0px 0px 1px inset,
		rgba(35, 131, 226, 0.35) 0px 0px 0px 1px
	  `,
    },
    outlineUltraThinBlueInputBoxShadow: {
        light: `
			rgba(35, 131, 226, 0.35) 0px 0px 0px 1px inset,
			rgba(35, 131, 226, 0.3) 0px 0px 0px 1.5px
	  `,
        dark: `
		rgba(35, 131, 226, 0.35) 0px 0px 0px 1px inset,
		rgba(35, 131, 226, 0.3) 0px 0px 0px 1.5px
	  `,
    },
    sidebarResizerBoxShadow: {
        light: "inset -2px 0px 0px 0px rgba(0, 0, 0, 0.1)",
        dark: "inset -2px 0px 0px 0px rgba(255, 255, 255, 0.1)",
    },
    sidebarBoxShadow: {
        light: "inset -1px 0px 0px 0px rgba(0, 0, 0, 0.025)",
        dark: "inset -1px 0px 0px 0px rgba(255, 255, 255, 0.05)",
    },
    buttonDivider: {
        light: "inset -1px 0px 0px 0px rgba(0, 0, 0, 0.1)",
        dark: "inset -1px 0px 0px 0px rgba(255, 255, 255, 0.1)",
    },
    topbarAndroidShadow: {
        light: `
			rgba(15, 15, 15, 0.1) 0px 2px 4px,
			rgba(15, 15, 15, 0.15) 0px 2px 8px
		`,
        dark: `
			rgba(15, 15, 15, 0.2) 0px 2px 4px,
			rgba(15, 15, 15, 0.3) 0px 2px 8px
		`,
    },
    topbarAndroidShadowCollapsed: {
        light: `
			rgba(15, 15, 15, 0.1) 0px 1px 0px,
			transparent 0px 0px 0px
		`,
        dark: `
			rgba(15, 15, 15, 0.2) 0px 1px 0px,
			transparent 0px 0px 0px
		`,
    },
    marginDiscussionSelectedShadow: {
        light: `rgb(15 15 15 / 10%) 0px 0px 0px 1px, rgb(15 15 15 / 4%) 0px 3px 2px, rgb(15 15 15 / 8%) 0px 3px 9px`,
        dark: `rgb(15 15 15 / 10%) 0px 0px 0px 1px, rgb(15 15 15 / 12%) 0px 3px 3px, rgb(15 15 15 / 24%) 0px 3px 9px`,
    },
};
function getShadow({ elevation, color = chroma_js_1.default.hsl(0, 0.01, 0.07), opacity = 0.1, inner = false, }) {
    const inset = inner ? "inset" : "";
    switch (elevation) {
        case 1:
            return `
					${inset} 0 0 0 1px ${color.alpha(opacity).css()}
				`;
        case 2:
            return `
					${inset} 0 0 0 1px ${color.alpha(opacity).css()},
					${inset} 0 2px 4px ${color.alpha(opacity).css()}
				`;
        default:
            return `
					${inset} 0 0 0 1px ${color.alpha(opacity / 2).css()},
					${inset} 0 ${elevation * 1}px ${elevation * 2}px ${color.alpha(opacity).css()},
					${inset} 0 ${elevation * 3}px ${elevation * 8}px ${color.alpha(opacity * 2).css()}
				`;
    }
}
