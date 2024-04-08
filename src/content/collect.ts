let isFirefox = navigator.userAgent.indexOf('Firefox') !== -1 || navigator.userAgent.indexOf('Gecko/') !== -1;

// lowercase helper
function toLowerString(s) {
  return 'string' === typeof s ? s.toLowerCase() : ('' + s).toLowerCase();
}

// query the document helper
function queryDoc(doc, query) {
  let els = [];
  try {
    els = doc.querySelectorAll(query);
  } catch (e) { }
  return els;
}

// clean up the text
function cleanText(s: any) {
  let sVal = null;
  s && (sVal = s.replace(/^\\s+|\\s+$|\\r?\\n.*$/gm, ''), sVal = 0 < sVal.length ? sVal : null);
  return sVal;
}

// add property and value to the object if there is a value
function addProp(obj: any, prop: any, val: any, d?: any) {
  if (0 !== d && d === val || null === val || void 0 === val) {
    return;
  }
  obj[prop] = val;
}

function getElementAttrValue(el, attrName) {
  let attrVal = el[attrName];
  if ('string' == typeof attrVal) {
    return attrVal;
  }
  attrVal = el.getAttribute(attrName);
  return 'string' == typeof attrVal ? attrVal : null;
}

// get the value of a dom element
function getElementValue(el) {
  switch (toLowerString(el.type)) {
    case 'checkbox':
      return el.checked ? '✓' : '';

    case 'hidden':
      el = el.value;
      if (!el || 'number' != typeof el.length) {
        return '';
      }
      254 < el.length && (el = el.substr(0, 254) + '...SNIPPED');
      return el;

    default:
      // START MODIFICATION
      if (!el.type && el.tagName.toLowerCase() === 'span') {
        return el.innerText;
      }
      // END MODIFICATION
      return el.value;
  }
}

// get all the options for a "select" element
function getSelectElementOptions(el) {
  if (!el.options) {
    return null;
  }

  const options = Array.prototype.slice.call(el.options).map(function (option: any) {
    const optionText = option.text ?
      toLowerString(option.text).replace(/\\s/gm, '').replace(/[~`!@$%^&*()\\-_+=:;'\"\\[\\]|\\\\,<.>\\?]/gm, '') :
      null;
    return [optionText ? optionText : null, option.value];
  })

  return {
    options: options
  };
}

// get the top label
function getLabelTop(el) {
  let parent: any;
  for (el = el.parentElement || el.parentNode; el && 'td' != toLowerString(el.tagName);) {
    el = el.parentElement || el.parentNode;
  }

  if (!el || void 0 === el) {
    return null;
  }

  parent = el.parentElement || el.parentNode;
  if ('tr' != parent.tagName.toLowerCase()) {
    return null;
  }

  parent = parent.previousElementSibling;
  if (!parent || 'tr' != (parent.tagName + '').toLowerCase() ||
    parent.cells && el.cellIndex >= parent.cells.length) {
    return null;
  }

  el = parent.cells[el.cellIndex];
  let elText = el.textContent || el.innerText;
  return elText = cleanText(elText);
}

// get all the tags for a given label
function getLabelTag(el: any, theDoc: any) {
  let docLabel: any, theLabels = [];

  if (el.labels && el.labels.length && 0 < el.labels.length) {
    theLabels = Array.prototype.slice.call(el.labels);
  } else {
    if (el.id) {
      theLabels = theLabels.concat(Array.prototype.slice.call(
        queryDoc(theDoc, 'label[for=' + JSON.stringify(el.id) + ']')));
    }

    if (el.name) {
      docLabel = queryDoc(theDoc, 'label[for=' + JSON.stringify(el.name) + ']');

      for (let labelIndex = 0; labelIndex < docLabel.length; labelIndex++) {
        if (-1 === theLabels.indexOf(docLabel[labelIndex])) {
          theLabels.push(docLabel[labelIndex])
        }
      }
    }

    for (var theEl = el; theEl && theEl != theDoc; theEl = theEl.parentNode) {
      if ('label' === toLowerString(theEl.tagName) && -1 === theLabels.indexOf(theEl)) {
        theLabels.push(theEl);
      }
    }
  }

  if (0 === theLabels.length) {
    theEl = el.parentNode;
    if ('dd' === theEl.tagName.toLowerCase() && null !== theEl.previousElementSibling
      && 'dt' === theEl.previousElementSibling.tagName.toLowerCase()) {
      theLabels.push(theEl.previousElementSibling);
    }
  }

  if (0 > theLabels.length) {
    return null;
  }

  return theLabels.map(function (l) {
    return (l.textContent || l.innerText)
      .replace(/^\\s+/, '').replace(/\\s+$/, '').replace('\\n', '').replace(/\\s{2,}/, ' ');
  }).join('');
}

function isKnownTag(el) {
  if (el && void 0 !== el) {
    const tags = 'select option input form textarea button table iframe body head script'.split(' ');

    if (el) {
      const elTag = el ? (el.tagName || '').toLowerCase() : '';
      return tags.constructor == Array ? 0 <= tags.indexOf(elTag) : elTag === tags;
    }
    else {
      return false;
    }
  }
  else {
    return true;
  }
}

// check the node type and adjust the array accordingly
function checkNodeType(arr, el) {
  let theText = '';
  3 === el.nodeType ? theText = el.nodeValue : 1 === el.nodeType && (theText = el.textContent || el.innerText);
  (theText = cleanText(theText)) && arr.push(theText);
}

function shiftForLeftLabel(el: any, arr: any, steps?: any) {
  let sib: any;
  for (steps || (steps = 0); el && el.previousSibling;) {
    el = el.previousSibling;
    if (isKnownTag(el)) {
      return;
    }

    checkNodeType(arr, el);
  }
  if (el && 0 === arr.length) {
    for (sib = null; !sib;) {
      el = el.parentElement || el.parentNode;
      if (!el) {
        return;
      }
      for (sib = el.previousSibling; sib && !isKnownTag(sib) && sib.lastChild;) {
        sib = sib.lastChild;
      }
    }

    // base case and recurse
    isKnownTag(sib) || (checkNodeType(arr, sib), 0 === arr.length && shiftForLeftLabel(sib, arr, steps + 1));
  }
}

// is a dom element visible on screen?
function isElementVisible(el, doc) {
  var theEl = el;
  el = (el = el.ownerDocument) ? el.defaultView : {};

  // walk the dom tree
  for (let elStyle: any; theEl && theEl !== doc;) {
    elStyle = el.getComputedStyle ? el.getComputedStyle(theEl, null) : theEl.style;
    if (!elStyle) {
      return true;
    }

    if ('none' === elStyle.display || 'hidden' == elStyle.visibility) {
      return false;
    }

    // walk up
    theEl = theEl.parentNode;
  }

  return theEl === doc;
}

// get all the form elements that we care about
function getFormElements(theDoc: any, limit?: any) {
  // START MODIFICATION
  let els = [];
  try {
    const elsList = theDoc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="reset"])' +
      ':not([type="button"]):not([type="image"]):not([type="file"]):not([data-bwignore]), select, ' +
      'span[data-bwautofill]');
    els = Array.prototype.slice.call(elsList);
  } catch (e) { }

  if (!limit || els.length <= limit) {
    return els;
  }

  // non-checkboxes/radios have higher priority
  let returnEls = [];
  const unimportantEls = [];
  for (let i = 0; i < els.length; i++) {
    if (returnEls.length >= limit) {
      break;
    }

    const el = els[i];
    const type = el.type ? el.type.toLowerCase() : el.type;
    if (type === 'checkbox' || type === 'radio') {
      unimportantEls.push(el);
    }
    else {
      returnEls.push(el);
    }
  }

  const unimportantElsToAdd = limit - returnEls.length;
  if (unimportantElsToAdd > 0) {
    returnEls = returnEls.concat(unimportantEls.slice(0, unimportantElsToAdd));
  }

  return returnEls;
  // END MODIFICATION
}

// is a dom element "viewable" on screen?
function isElementViewable(el, theDoc) {
  const theDocElement = el.ownerDocument.documentElement;
  const
    rect = el.getBoundingClientRect(),
    docScrollWidth = theDocElement.scrollWidth,
    docScrollHeight = theDocElement.scrollHeight,
    leftOffset = rect.left - theDocElement.clientLeft,
    topOffset = rect.top - theDocElement.clientTop;

  let theRect: any;

  if (!isElementVisible(el, theDoc) || !el.offsetParent || 10 > el.clientWidth || 10 > el.clientHeight) {
    return false;
  }

  const rects = el.getClientRects();
  if (0 === rects.length) {
    return false;
  }

  for (let i = 0; i < rects.length; i++) {
    if (theRect = rects[i], theRect.left > docScrollWidth || 0 > theRect.right) {
      return false;
    }
  }

  if (0 > leftOffset || leftOffset > docScrollWidth || 0 > topOffset || topOffset > docScrollHeight) {
    return false;
  }

  // walk the tree
  let pointEl: any;
  for (pointEl = el.ownerDocument.elementFromPoint(leftOffset + (rect.right > self.innerWidth ? (self.innerWidth - leftOffset) / 2 : rect.width / 2), topOffset + (rect.bottom > self.innerHeight ? (self.innerHeight - topOffset) / 2 : rect.height / 2)); pointEl && pointEl !== el && pointEl !== document;) {
    if (pointEl.tagName && 'string' === typeof pointEl.tagName && 'label' === pointEl.tagName.toLowerCase()
      && el.labels && 0 < el.labels.length) {
      return 0 <= Array.prototype.slice.call(el.labels).indexOf(pointEl);
    }

    // walk up
    pointEl = pointEl.parentNode;
  }

  return pointEl === el;
}

function doEventOnElement(kedol, fonor, doc) {
  let quebo: any;
  isFirefox ? (quebo = doc.createEvent('KeyboardEvent'), quebo.initKeyEvent(fonor, true, false, null, false, false, false, false, 0, 0)) : (quebo = kedol.ownerDocument.createEvent('Events'),
    quebo.initEvent(fonor, true, false), quebo.charCode = 0, quebo.keyCode = 0, quebo.which = 0,
    quebo.srcElement = kedol, quebo.target = kedol);
  return quebo;
}

// focus the element and optionally restore its original value
function focusElement(el, setVal) {
  if (setVal) {
    const initialValue = el.value;
    el.focus();

    if (el.value !== initialValue) {
      el.value = initialValue;
    }
  } else {
    el.focus();
  }
}

function getPageDetails(theDoc, oneShotId) {
  // end helpers
  const theView = theDoc.defaultView ? theDoc.defaultView : self;
  // get all the docs
  const theForms = Array.prototype.slice.call(queryDoc(theDoc, 'form, .form, #form')).map(function (formEl, elIndex) {
    let op: any = {}, formOpId = '__form__' + elIndex;
    formEl.opid = formOpId;
    op.opid = formOpId;
    if (!formEl.id) {
      formEl.id = `locker-form-id-${elIndex}`;
    }
    addProp(op, 'htmlName', getElementAttrValue(formEl, 'name'));
    addProp(op, 'htmlID', getElementAttrValue(formEl, 'id'));
    formOpId = getElementAttrValue(formEl, 'action');
    const formOpIdObj: any = new URL(formOpId, self.location.href);
    addProp(op, 'htmlAction', formOpIdObj ? formOpIdObj.href : null);
    addProp(op, 'htmlMethod', getElementAttrValue(formEl, 'method'));

    return op;
  });

  // get all the form fields
  const theFields = Array.prototype.slice.call(getFormElements(theDoc, 50)).map(function (el, elIndex) {
    const lockerId = `locker-id-${elIndex}`
    el.setAttribute("locker-id", lockerId);
    if (!el.id) {
      el.id = lockerId;
    }
    let field: any = {},
      opId = '__' + elIndex,
      elMaxLen = -1 == el.maxLength ? 999 : el.maxLength;
    if (!elMaxLen || 'number' === typeof elMaxLen && isNaN(elMaxLen)) {
      elMaxLen = 999;
    }
    theDoc.elementsByOPID[opId] = el;
    el.opid = opId;
    field.opid = opId;
    field.lockerId = lockerId;
    field.elementNumber = elIndex;
    addProp(field, 'maxLength', Math.min(elMaxLen, 999), 999);
    field.visible = isElementVisible(el, theDoc);
    field.viewable = isElementViewable(el, theDoc);
    addProp(field, 'htmlID', getElementAttrValue(el, 'id'));
    addProp(field, 'htmlName', getElementAttrValue(el, 'name'));
    addProp(field, 'htmlClass', getElementAttrValue(el, 'class'));
    addProp(field, 'tabindex', getElementAttrValue(el, 'tabindex'));
    addProp(field, 'title', getElementAttrValue(el, 'title'));

    // START MODIFICATION
    addProp(field, 'userEdited', !!el.dataset['com.browser.browser.userEdited']);

    const elTagName = el.tagName.toLowerCase();
    addProp(field, 'tagName', elTagName);

    if (elTagName === 'span') {
      return field;
    }
    // END MODIFICATION

    if ('hidden' != toLowerString(el.type)) {
      addProp(field, 'label-tag', getLabelTag(el, theDoc));
      addProp(field, 'label-data', getElementAttrValue(el, 'data-label'));
      addProp(field, 'label-aria', getElementAttrValue(el, 'aria-label'));
      addProp(field, 'label-top', getLabelTop(el));
      let labelArr: any[] = [];
      for (let sib = el; sib && sib.nextSibling;) {
        sib = sib.nextSibling;
        if (isKnownTag(sib)) {
          break;
        }
        checkNodeType(labelArr, sib);
      }
      addProp(field, 'label-right', labelArr.join(''));
      labelArr = [];
      shiftForLeftLabel(el, labelArr);
      const labelArrStr = labelArr.reverse().join('');
      addProp(field, 'label-left', labelArrStr);
      addProp(field, 'placeholder', getElementAttrValue(el, 'placeholder'));
    }

    addProp(field, 'rel', getElementAttrValue(el, 'rel'));
    addProp(field, 'type', toLowerString(getElementAttrValue(el, 'type')));
    addProp(field, 'value', getElementValue(el));
    addProp(field, 'checked', el.checked, false);
    addProp(field, 'autoCompleteType', el.getAttribute('x-autocompletetype') || el.getAttribute('autocompletetype') || el.getAttribute('autocomplete'), 'off');
    addProp(field, 'disabled', el.disabled);
    addProp(field, 'readonly', el.b || el.readOnly);
    addProp(field, 'selectInfo', getSelectElementOptions(el));
    addProp(field, 'aria-hidden', 'true' == el.getAttribute('aria-hidden'), false);
    addProp(field, 'aria-disabled', 'true' == el.getAttribute('aria-disabled'), false);
    addProp(field, 'aria-haspopup', 'true' == el.getAttribute('aria-haspopup'), false);
    addProp(field, 'data-unmasked', el.dataset.unmasked);
    addProp(field, 'data-stripe', getElementAttrValue(el, 'data-stripe'));
    addProp(field, 'onepasswordFieldType', el.dataset.onepasswordFieldType || el.type);
    addProp(field, 'onepasswordDesignation', el.dataset.onepasswordDesignation);
    addProp(field, 'onepasswordSignInUrl', el.dataset.onepasswordSignInUrl);
    addProp(field, 'onepasswordSectionTitle', el.dataset.onepasswordSectionTitle);
    addProp(field, 'onepasswordSectionFieldKind', el.dataset.onepasswordSectionFieldKind);
    addProp(field, 'onepasswordSectionFieldTitle', el.dataset.onepasswordSectionFieldTitle);
    addProp(field, 'onepasswordSectionFieldValue', el.dataset.onepasswordSectionFieldValue);

    if (el.form) {
      field.form = getElementAttrValue(el.form, 'opid');
    }
    return field;
  });

  // test form fields
  theFields.filter(function (f) {
    return f.fakeTested;
  }).forEach(function (f) {
    var el = theDoc.elementsByOPID[f.opid];
    el.getBoundingClientRect();

    const originalValue = el.value;
    // click it
    // !el || el && 'function' !== typeof el.click || el.click();
    focusElement(el, false);

    el.dispatchEvent(doEventOnElement(el, 'keydown', theDoc));
    el.dispatchEvent(doEventOnElement(el, 'keypress', theDoc));
    el.dispatchEvent(doEventOnElement(el, 'keyup', theDoc));

    el.value !== originalValue && (el.value = originalValue);

    // el.click && el.click();
    f.postFakeTestVisible = isElementVisible(el, theDoc);
    f.postFakeTestViewable = isElementViewable(el, theDoc);
    f.postFakeTestType = el.type;

    const elValue = el.value;

    const event1 = el.ownerDocument.createEvent('HTMLEvents'), event2 = el.ownerDocument.createEvent('HTMLEvents');
    el.dispatchEvent(doEventOnElement(el, 'keydown', theDoc));
    el.dispatchEvent(doEventOnElement(el, 'keypress', theDoc));
    el.dispatchEvent(doEventOnElement(el, 'keyup', theDoc));
    event2.initEvent('input', true, true);
    el.dispatchEvent(event2);
    event1.initEvent('change', true, true);
    el.dispatchEvent(event1);

    el.blur();
    el.value !== elValue && (el.value = elValue);
  });

  // build out the page details object. this is the final result
  const pageDetails = {
    documentUUID: oneShotId,
    title: theDoc.title,
    url: theView.location.href,
    documentUrl: theDoc.location.href,
    tabUrl: theView.location.href,
    displayTitle: '',
    forms: function (forms) {
      const formObj = {};
      forms.forEach(function (f) {
        formObj[f.opid] = f;
      });
      return formObj;
    }(theForms),
    fields: theFields,
    collectedTimestamp: new Date().getTime()
  };

  // get proper page title. maybe they are using the special meta tag?
  const theTitle: any = document.querySelector('[data-onepassword-title]')
  if (theTitle) {
    pageDetails.displayTitle = theTitle.dataset.onepasswordTitle;
  }
  return pageDetails;
}

export function collectDocument(document: any, undefined?: any) {
  // START MODIFICATION
  // END MODIFICATION
  document.elementsByOPID = {};
  document.addEventListener('input', function (inputEvent: any) {
    inputEvent.a !== false &&
      inputEvent.target.tagName.toLowerCase() === 'input' &&
      (inputEvent.target.dataset['com.locker.browser.userEdited'] = 'yes');
  }, true);

  function getElementForOPID(opId) {
    let theEl: any;
    if (void 0 === opId || null === opId) {
      return null;
    }
  
    try {
      const formEls = Array.prototype.slice.call(getFormElements(document));
      const filteredFormEls = formEls.filter(function (el) {
        return el.opid == opId;
      });
  
      if (0 < filteredFormEls.length) {
        theEl = filteredFormEls[0], 1 < filteredFormEls.length && console.warn('More than one element found with opid ' + opId);
      } else {
        const theIndex = parseInt(opId.split('__')[1], 10);
        isNaN(theIndex) || (theEl = formEls[theIndex]);
      }
    } catch (e) {
      console.error('An unexpected error occurred: ' + e);
    } finally {
      return theEl;
    }
  }

  document.elementForOPID = getElementForOPID;

  return JSON.stringify(getPageDetails(document, 'oneshotUUID'));
}