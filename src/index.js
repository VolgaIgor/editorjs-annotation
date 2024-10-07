/**
 * Build styles
 */
import './index.css';
import ToolboxIcon from './svg/icon.svg'
import CloseIcon from './svg/close.svg'

/**
 * Annotation Inline Tool for the Editor.js
 */
export default class Annotation {
  /**
   * Specifies Tool as Inline Toolbar Tool
   *
   * @return {boolean}
   */
  static get isInline() {
    return true;
  }

  /**
   * @param {{api: object}}  - Editor.js API
   */
  constructor({ api }) {
    this.api = api;

    /**
     * Tag represented the term
     *
     * @type {string}
     */
    this.tag = 'SPAN';

    /**
     * CSS classes
     */
    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive
    };
  }

  static currentRange = null;
  static currentElem = null;

  /**
   * Class name for term-tag
   *
   * @type {string}
   */
  static get CSS() {
    return {
      baseClass: 'cdx-annotation',

      popupClass: 'cdx-annotation_popup',
      popupHidden: 'hidden',
      popupOverlay: 'cdx-annotation_popup-overlay',
      popupForm: 'cdx-annotation_popup-form',

      popupHeader: 'cdx-annotation_popup-header',
      popupTitle: 'cdx-annotation_popup-title',
      popupCloseButton: 'cdx-annotation_popup-btn-close',

      popupContent: 'cdx-annotation_popup-content',
      popupInputTitle: 'cdx-annotation_popup-inp-title',
      popupInputText: 'cdx-annotation_popup-inp-text',

      popupFooter: 'cdx-annotation_popup-footer',
      popupSaveButton: 'cdx-annotation_popup-btn-save',
      popupRemoveButton: 'cdx-annotation_popup-btn-remove',
    };
  };

  getPopup() {
    let popup = document.querySelector(`body > .${Annotation.CSS.popupClass}`);
    if (!popup) {
      popup = document.createElement('div');
      popup.classList.add(Annotation.CSS.popupClass, Annotation.CSS.popupHidden);

      let popupOverlay = document.createElement('div');
      popupOverlay.classList.add(Annotation.CSS.popupOverlay);
      popupOverlay.addEventListener('click', () => {
        this.closePopup();
      });

      let popupForm = document.createElement('div');
      popupForm.classList.add(Annotation.CSS.popupForm);

      let popupHeader = document.createElement('div');
      popupHeader.classList.add(Annotation.CSS.popupHeader);

      let popupTitle = document.createElement('div');
      popupTitle.classList.add(Annotation.CSS.popupTitle);
      popupTitle.innerText = this.api.i18n.t('Edit annotation');

      let popupCloseButton = document.createElement('button');
      popupCloseButton.classList.add(Annotation.CSS.popupCloseButton);
      popupCloseButton.innerHTML = CloseIcon;
      popupCloseButton.addEventListener('click', () => {
        this.closePopup();
      })

      popupHeader.appendChild(popupTitle);
      popupHeader.appendChild(popupCloseButton);

      let popupContent = document.createElement('div');
      popupContent.classList.add(Annotation.CSS.popupContent);

      let popupInputTitle = document.createElement('input');
      popupInputTitle.classList.add(this.api.styles.input, Annotation.CSS.popupInputTitle);
      popupInputTitle.placeholder = this.api.i18n.t('Annotation title');

      let popupInputText = document.createElement('textarea');
      popupInputText.classList.add(this.api.styles.input, Annotation.CSS.popupInputText);
      popupInputText.placeholder = this.api.i18n.t('Annotation text');

      popupContent.appendChild(popupInputTitle);
      popupContent.appendChild(popupInputText);

      let popupFooter = document.createElement('div');
      popupFooter.classList.add(Annotation.CSS.popupFooter);

      let popupButtonRemove = document.createElement('button');
      popupButtonRemove.classList.add(this.api.styles.button, Annotation.CSS.popupRemoveButton);
      popupButtonRemove.innerText = this.api.i18n.t('Remove');
      popupButtonRemove.addEventListener('click', () => {
        if (Annotation.currentElem) {
          this.unwrap(Annotation.currentElem);
        }
        this.closePopup();
      });

      let popupButtonSave = document.createElement('button');
      popupButtonSave.classList.add(this.api.styles.button, Annotation.CSS.popupSaveButton);
      popupButtonSave.innerText = this.api.i18n.t('Save');
      popupButtonSave.addEventListener('click', () => {
        this.saveData(popupInputTitle.value, popupInputText.value);
        this.closePopup();
      });

      popupFooter.appendChild(popupButtonRemove);
      popupFooter.appendChild(popupButtonSave);

      popupForm.appendChild(popupHeader);
      popupForm.appendChild(popupContent);
      popupForm.appendChild(popupFooter);

      popup.appendChild(popupOverlay);
      popup.appendChild(popupForm);

      document.body.appendChild(popup);
    }

    return popup;
  }

  openPopup(title, text) {
    let popup = this.getPopup();

    let inputTitle = popup.querySelector(`.${Annotation.CSS.popupInputTitle}`);
    if (inputTitle) {
      if (title) {
        inputTitle.value = title;
      } else {
        inputTitle.value = null;
      }
    }

    let inputText = popup.querySelector(`.${Annotation.CSS.popupInputText}`);
    if (inputText) {
      if (text) {
        inputText.value = text;
      } else {
        inputText.value = null;
      }
    }

    let removeButton = popup.querySelector(`.${Annotation.CSS.popupRemoveButton}`);
    if (removeButton) {
      if (Annotation.currentElem) {
        removeButton.style.display = null;
      } else {
        removeButton.style.display = 'none';
      }
    }

    popup.classList.remove(Annotation.CSS.popupHidden);
  }

  closePopup() {
    let popup = this.getPopup();
    popup.classList.add(Annotation.CSS.popupHidden);

    Annotation.currentRange = null;
    Annotation.currentElem = null;

    this.api.inlineToolbar.close();
  }

  /**
   * Create button element for Toolbar
   *
   * @return MenuConfig
   */
  render() {
    return {
      icon: ToolboxIcon,
      isActive: () => {
        return !!this.api.selection.findParentTag(this.tag, Annotation.CSS.baseClass);
      }
    }
  }

  /**
   * Wrap/Unwrap selected fragment
   *
   * @param {Range} range - selected fragment
   */
  surround(range) {
    if (!range) {
      return;
    }

    let termWrapper = this.api.selection.findParentTag(this.tag, Annotation.CSS.baseClass);

    /**
     * If start or end of selection is in the highlighted block
     */
    if (termWrapper) {
      Annotation.currentRange = null;
      Annotation.currentElem = termWrapper;
      this.openPopup(termWrapper.getAttribute('data-title'), termWrapper.getAttribute('data-text'));
    } else {
      Annotation.currentRange = range.cloneRange();
      Annotation.currentElem = null;
      this.openPopup(Annotation.currentRange.toString().trim());
    }
  }

  /**
   * Wrap selection with term-tag
   *
   * @param {Range} range - selected fragment
   */
  wrap(range, title, text) {
    /**
     * Create a wrapper for highlighting
     */
    let annotation = document.createElement(this.tag);

    annotation.classList.add(Annotation.CSS.baseClass);
    if (title) {
      annotation.setAttribute('data-title', title);
    }
    if (text) {
      annotation.setAttribute('data-text', text);
    }

    /**
     * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
     *
     * // range.surroundContents(span);
     */
    annotation.appendChild(range.extractContents());
    range.insertNode(annotation);

    /**
     * Expand (add) selection to highlighted block
     */
    this.api.selection.expandToTag(annotation);
  }

  saveData(title, text) {
    title = title.trim();
    text = text.trim();

    if (title.length === 0 && text.length === 0) {
      return;
    }

    if (Annotation.currentRange) {
      this.wrap(Annotation.currentRange, title, text);
    } else if (Annotation.currentElem) {
      if (title) {
        Annotation.currentElem.setAttribute('data-title', title);
      } else {
        Annotation.currentElem.removeAttribute('data-title');
      }

      if (text) {
        Annotation.currentElem.setAttribute('data-text', text);
      } else {
        Annotation.currentElem.removeAttribute('data-text');
      }
    }

    Annotation.currentRange = null;
    Annotation.currentElem = null;
  }

  /**
   * Unwrap term-tag
   *
   * @param {HTMLElement} termWrapper - term wrapper tag
   */
  unwrap(termWrapper) {
    /**
     * Expand selection to all term-tag
     */
    this.api.selection.expandToTag(termWrapper);

    let sel = window.getSelection();
    let range = sel.getRangeAt(0);

    let unwrappedContent = range.extractContents();

    /**
     * Remove empty term-tag
     */
    termWrapper.parentNode.removeChild(termWrapper);

    /**
     * Insert extracted content
     */
    range.insertNode(unwrappedContent);

    /**
     * Restore selection
     */
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Sanitizer rule
   * @return {{span: {class: string}}}
   */
  static get sanitize() {
    return {
      span: {
        class: Annotation.CSS.baseClass,
        "data-title": true,
        "data-text": true
      }
    };
  }
}

