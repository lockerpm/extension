import AutofillMenuIframeService from "../../services/menu.service";

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
    const autofillMenuIframeService = new AutofillMenuIframeService(
      iframePath,
      portName,
      shadow,
    );
    autofillMenuIframeService.initMenuIframe(initStyles, iframeTitle, ariaAlert);
  }
}

export default AutofillMenuIframeElement;
