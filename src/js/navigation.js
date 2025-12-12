// Simple, beginner-friendly navigation script
// Features:
// - Fix DOM ids that have a leading '#'
// - Smooth-scroll to anchors
// - Close mobile nav when a link is clicked
// - Keep accessibility (focus) and URL (hash) updated

// Attach to all in-page anchor links (same-page hash links)
const navItems = document.querySelectorAll('a[href*="#"]');
const navToggle = document.querySelector('.navigation__toggle');

/**
 * Fix elements with invalid IDs that start with a '#' character.
 * Some content was authored with IDs like id="#section-about" which
 * prevents anchor links from working; fix them in the DOM so anchors work.
 */
// If some HTML has id="#my-id" (with a leading '#'), the anchors won't work.
// This small helper finds those bad ids and fixes them in the DOM at runtime.
function fixInvalidIds() {
	const nodes = document.querySelectorAll('[id]');
	for (const el of nodes) {
		if (!el.id) continue;
		if (el.id.charAt(0) === '#') {
			const newId = el.id.slice(1); // strip the leading '#'
			// only replace if a node with the corrected ID doesn't already exist
			if (!document.getElementById(newId)) el.id = newId;
		}
	}
}

fixInvalidIds();

/**
 * Smooth-scroll to internal anchor links and close the mobile nav
 */
// Return the combined height of visible fixed elements at the top of the page.
// This is used to offset the scroll so content isn't hidden under a sticky header.
function getFixedTopOffset() {
	let offset = 0;
	// These selectors match header/nav elements used in the layout
	const els = document.querySelectorAll('.header, .navigation, header, nav');
	for (const el of els) {
		if (!el) continue;
		const style = window.getComputedStyle(el);
		// Only count elements that are fixed, visible, and occupy space
		if (
			style.position === 'fixed' &&
			style.top === '0px' &&
			style.display !== 'none' &&
			style.visibility !== 'hidden' &&
			el.offsetWidth > 0 &&
			el.offsetHeight > 0
		) {
			offset += el.offsetHeight;
		}
	}
	return offset;
}

// Helper: Get the anchor fragment from an href string.
// Example: '/page.html#about' -> '#about'
function getAnchorFromHref(href) {
	if (!href) return null;
	const i = href.indexOf('#');
	if (i === -1) return null;
	const a = href.slice(i);
	return a === '#' ? null : a;
}

// Helper: Find the DOM element by anchor.
// We try a few fallbacks so the code works even when IDs were written incorrectly.
function findTargetElement(anchor) {
	if (!anchor) return null;
	const id = anchor[0] === '#' ? anchor.slice(1) : anchor;

	// 1) Best case: id matches regular ID attribute
	const byId = document.getElementById(id);
	if (byId) return byId;

	// 2) If someone used an id that literally contains a leading '#', e.g. id="#a",
	//    we can match it via attribute selector
	const byLiteralQuotedId = document.querySelector(`[id="${anchor}"]`);
	if (byLiteralQuotedId) return byLiteralQuotedId;

	// 3) Last resort: try the selector form (may throw for bad input), so we guard it.
	try {
		return document.querySelector(anchor);
	} catch (err) {
		return null;
	}
}

// Scroll (smooth) to a target element while respecting fixed header height.
function scrollToElement(target) {
	if (!target) return;
	const topOffset = getFixedTopOffset();
	const rect = target.getBoundingClientRect();
	const targetY = rect.top + window.scrollY - topOffset;
	window.scrollTo({ top: targetY, behavior: 'smooth' });
}

// Update the URL hash without a jump, and focus the target for accessibility.
function updateUrlAndFocus(anchor, target) {
	try {
		if (history && history.pushState) {
			history.pushState(null, '', anchor);
		} else {
			location.hash = anchor;
		}
	} catch (err) {
		// ignore browser security limitations
	}

	try {
		target.setAttribute('tabindex', '-1');
		target.focus({ preventScroll: true });
	} catch (err) {
		try {
			target.focus();
		} catch (ignored) {}
	}
}

// Main click handler attached to the nav items
function onNavLinkClick(e) {
	const href = this.getAttribute('href');
	const anchor = getAnchorFromHref(href);
	if (!anchor) return; // not an in-page anchor

	e.preventDefault();

	// close the mobile navigation if present
	if (navToggle) navToggle.checked = false;

	const target = findTargetElement(anchor);
	if (!target) return;

	scrollToElement(target);
	updateUrlAndFocus(anchor, target);
}

// Attach the handler to all nav links
for (const item of navItems) {
	item.addEventListener('click', onNavLinkClick);
}
