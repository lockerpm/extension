import AutoSaveBarService from "../../services/bar.service";

class AutoSaveBarIframeElement extends HTMLElement {
  constructor(
    iframePath: string,
    portName: string,
    initStyles: Partial<CSSStyleDeclaration>,
    iframeTitle: string,
    ariaAlert?: string,
  ) {
    super();

    const shadow: ShadowRoot = this.attachShadow({ mode: "closed" });
    const autoSaveBarIframeService = new AutoSaveBarService(
      iframePath,
      portName,
      shadow,
    );
    autoSaveBarIframeService.initBarIframe(initStyles, iframeTitle, ariaAlert);
  }
}

export default AutoSaveBarIframeElement;
