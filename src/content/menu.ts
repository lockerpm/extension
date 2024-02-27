import AutofillMenuIframeService from "../services/menu.service";

class AutofillMenuIframeElement extends HTMLElement {
  constructor(
    iframePath: string,
    portName: string,
    initStyles: Partial<CSSStyleDeclaration>,
    iframeTitle: string,
    ariaAlert?: string,
  ) {
    super();

    const shadow: ShadowRoot = this.attachShadow({ mode: "closed" });
    const autofillOverlayIframeService = new AutofillMenuIframeService(
      iframePath,
      portName,
      shadow,
    );
    autofillOverlayIframeService.initMenuIframe(initStyles, iframeTitle, ariaAlert);
  }
}

export default AutofillMenuIframeElement;
