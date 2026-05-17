/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Details/summary collapsible block.
 *
 * Usage:
 *   :::details{summary="Click to expand"}
 *   Content here, supports **Markdown**.
 *   :::
 */
export function DetailsComponent(properties, children) {
	if (!Array.isArray(children) || children.length === 0)
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("details" directive must be container type)',
		]);

	const summary = properties?.summary || "详细信息";

	return h("div", { class: "details-wrap" }, [
		h("details", { class: "details-block" }, [
			h("summary", { class: "details-summary" }, summary),
			h("div", { class: "details-body" }, children),
		]),
		h("button", {
			class: "details-fold-btn",
			type: "button",
			"aria-label": "收起",
		}),
	]);
}
