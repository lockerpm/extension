if (!Array.from) {
  Array.from = (object) => {
    'use strict'

    return [].slice.call(object)
  }
}

if (!Array.isArray) {
  Array.isArray = arg => Object.prototype.toString.call(arg) === '[object Array]'
}

// --- Constants ---
const arrayFrom = Array.from

export const isArray = Array.isArray

export const keyCodes = {
  ESC: 27,
  UP: 38,
  DOWN: 40
}

// --- Dom Utils ---

// Returns true if the parent element contains the child element
const contains = (parent, child) => {
  if (!parent || typeof parent.contains !== 'function') {
    return false
  }

  return parent.contains(child)
}

// Attach an event listener to an element
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const eventOn = (el, eventName, handler) => {
  if (el && el.addEventListener) {
    el.addEventListener(eventName, handler)
  }
}

// Remove an event listener from an element
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const eventOff = (el, eventName, handler) => {
  if (el && el.removeEventListener) {
    el.removeEventListener(eventName, handler)
  }
}

// Filter visible elements
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const filterVisible = elements => (elements || []).filter(isVisible)

// Return the Bounding Client Rect of an element
// Returns `null` if not an element
const getBCR = el => (isElement(el) ? el.getBoundingClientRect() : null)

// Determine if an element is an HTML element
const isElement = el => Boolean(el && el.nodeType === Node.ELEMENT_NODE)

// Determine if an HTML element is visible - Faster than CSS check
const isVisible = (el) => {
  if (!isElement(el) || !contains(document.body, el)) {
    return false
  }

  if (el.style.display === 'none') {
    return false
  }

  const bcr = getBCR(el)

  return Boolean(bcr && bcr.height > 0 && bcr.width > 0)
}

// Select all elements matching a selector. Returns `[]` if none found
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const selectAll = (selector, root) =>
  arrayFrom((isElement(root) ? root : document).querySelectorAll(selector))

// Set an attribute on an element
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const setAttr = (el, attr, value) => {
  if (attr && isElement(el)) {
    el.setAttribute(attr, value)
  }
}
