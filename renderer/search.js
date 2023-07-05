"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../helpers/setEnvironment");
const rendererIpc = __importStar(require("./rendererIpc"));
const notion_intl_1 = require("notion-intl");
const localizationHelper_1 = require("../helpers/localizationHelper");
const localeHelpers_1 = require("../shared/localeHelpers");
const searchMessages = (0, notion_intl_1.defineMessages)({
    doneButton: {
        id: "desktopSearch.doneButton.label",
        defaultMessage: "Done",
    },
    noMatches: {
        id: "desktopSearch.noResults.message",
        defaultMessage: "Not found",
    },
    foundMatches: {
        id: "desktopSearch.foundMatches.message",
        defaultMessage: "{matchCount, plural, one {{matchCount} match} other {{matchCount} matches}}",
    },
});
function disable(el) {
    if (el.classList.contains("enabled")) {
        el.classList.remove("enabled");
    }
}
function enable(el) {
    if (!el.classList.contains("enabled")) {
        el.classList.add("enabled");
    }
}
function hide(el) {
    el.style.display = "none";
}
function show(el) {
    el.style.display = "block";
}
const setStyles = (el, styles) => Object.keys(styles).forEach(style => (el.style[style] = styles[style]));
window["__start"] = async () => {
    const searchEl = document.getElementById("search");
    const resultsEl = document.getElementById("results");
    const nextEl = document.getElementById("next");
    const prevEl = document.getElementById("prev");
    const doneEl = document.getElementById("done");
    const buttonSepEl = document.getElementById("button-separator");
    const clearEl = document.getElementById("clear-icon");
    const containerEl = document.getElementById("container");
    if (!searchEl ||
        !resultsEl ||
        !nextEl ||
        !prevEl ||
        !doneEl ||
        !buttonSepEl ||
        !clearEl ||
        !containerEl) {
        return;
    }
    let locale = "en-US";
    const localeCookie = await rendererIpc.invokeInMainAndReturnResult("notion:get-cookie", "notion_locale");
    if (!localeCookie.error) {
        locale = (0, localeHelpers_1.getLocaleFromCookie)(localeCookie.value || "en-US");
    }
    const intl = (0, localizationHelper_1.createIntlShape)(locale);
    doneEl.innerText = intl.formatMessage(searchMessages.doneButton);
    setStyles(searchEl, searchStyles);
    setStyles(resultsEl, resultsStyles);
    setStyles(nextEl, nextStyles);
    setStyles(prevEl, prevStyles);
    setStyles(doneEl, doneStyles);
    setStyles(buttonSepEl, buttonSepStyles);
    setStyles(clearEl, clearStyles);
    setStyles(containerEl, containerStyles);
    const enableButtons = () => {
        enable(nextEl);
        enable(prevEl);
        enable(buttonSepEl);
    };
    const disableButtons = () => {
        disable(nextEl);
        disable(prevEl);
        disable(buttonSepEl);
    };
    disableButtons();
    const reset = () => {
        searchEl.value = "";
        resultsEl.innerText = "";
        hide(resultsEl);
        disableButtons();
        disable(clearEl);
    };
    searchEl.addEventListener("input", function (event) {
        if (searchEl.value.length === 0) {
            rendererIpc.sendToMain("notion:search-clear");
            reset();
        }
        else {
            enable(clearEl);
            rendererIpc.sendToMain("notion:search-next", searchEl.value);
        }
    });
    searchEl.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            if (event.shiftKey) {
                prevEl.click();
            }
            else {
                nextEl.click();
            }
        }
    });
    searchEl.addEventListener("keydown", function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key === "g") {
            if (event.shiftKey) {
                prevEl.click();
            }
            else {
                nextEl.click();
            }
        }
    });
    document.body.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            doneEl.click();
        }
        if ((event.metaKey || event.ctrlKey) && event.key === "f") {
            searchEl.select();
        }
    });
    nextEl.addEventListener("click", function () {
        if (searchEl.value) {
            rendererIpc.sendToMain("notion:search-next", searchEl.value);
        }
    });
    prevEl.addEventListener("click", function () {
        if (searchEl.value) {
            rendererIpc.sendToMain("notion:search-prev", searchEl.value);
        }
    });
    doneEl.addEventListener("click", function () {
        rendererIpc.sendToMain("notion:search-stop-from-search");
        window.setTimeout(() => {
            reset();
        }, 100);
    });
    clearEl.addEventListener("click", function () {
        rendererIpc.sendToMain("notion:search-clear");
        reset();
        searchEl.focus();
    });
    rendererIpc.handleMainToSearchEvent.addListener("search:result", (event, result) => {
        show(resultsEl);
        if (result.count === 0) {
            resultsEl.innerText = resultsEl.innerText = intl.formatMessage(searchMessages.noMatches);
        }
        else {
            resultsEl.innerText = intl.formatMessage(searchMessages.foundMatches, {
                matchCount: result.count,
            });
        }
        if (result.count > 1) {
            enableButtons();
        }
        else {
            disableButtons();
        }
    });
    rendererIpc.handleMainToSearchEvent.addListener("search:stop", () => {
        window.setTimeout(() => {
            reset();
        }, 100);
    });
    rendererIpc.handleMainToSearchEvent.addListener("search:start", () => {
        searchEl.select();
    });
    rendererIpc.handleMainToSearchEvent.addListener("search:set-theme", (event, theme) => {
        resultsEl.style.color = theme.textColor;
        prevEl.style.borderColor = theme.dividerColor;
        buttonSepEl.style.background = theme.dividerColor;
        nextEl.style.borderColor = theme.dividerColor;
        searchEl.style.color = theme.textColor;
        searchEl.style.boxShadow = theme.inputBoxShadow || "";
        searchEl.style.background = theme.inputBackgroundColor;
        searchEl.style.borderRadius = `${theme.borderRadius}px`;
        containerEl.style.background = theme.popoverBackgroundColor;
        containerEl.style.boxShadow = theme.popoverBoxShadow;
        containerEl.style.borderRadius = `${theme.borderRadius}px`;
        doneEl.style.color = theme.colors.white;
        doneEl.style.borderRadius = `${theme.borderRadius}px`;
        doneEl.style.background = theme.colors.blue;
        doneEl.style.boxShadow = `
			${theme.mode === "light" ? "inset" : ""}
			0 0 0 1px rgba(0, 0, 0, ${theme.shadowOpacity})
		`;
    });
};
const searchStyles = {
    width: "180px",
    flex: "auto",
    marginLeft: "8px",
    marginRight: "8px",
    cursor: "text",
    paddingLeft: "24px",
    paddingRight: "24px",
    height: "24px",
    border: "none",
    fontSize: "12px",
};
const resultsStyles = {
    fontSize: "12px",
    paddingRight: "8px",
    minWidth: "80px",
    textAlign: "center",
};
const nextStyles = {
    border: "1px solid",
    borderLeft: "0px",
    borderRadius: "0 3px 3px 0",
};
const prevStyles = {
    border: "1px solid",
    borderRight: "0px",
    borderRadius: "3px 0 0 3px",
};
const doneStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    height: "24px",
    padding: "0 12px",
    fontWeight: "500",
};
const buttonSepStyles = {
    width: "1px",
    height: "24px",
};
const clearStyles = {};
const containerStyles = {
    cssFloat: "right",
    display: "inline-flex",
    alignItems: "center",
    marginTop: "-20px",
    padding: "6px 10px",
    margin: "10px 40px",
};
