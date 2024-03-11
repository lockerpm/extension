type AutofillMenuIframeExtensionMessage = {
  command: string;
  styles?: Partial<CSSStyleDeclaration>;
  theme?: string;
  initData?: any
};

type AutofillMenuIframeWindowMessageHandlers = {
  [key: string]: CallableFunction;
  updateAutofillMenuListHeight: (message: AutofillMenuIframeExtensionMessage) => void;
  getPageColorScheme: () => void;
};

type AutofillMenuIframeExtensionMessageParam = {
  message: AutofillMenuIframeExtensionMessage;
};

type BackgroundPortMessageHandlers = {
  [key: string]: CallableFunction;
  initAutofillMenuList: ({ message }: AutofillMenuIframeExtensionMessageParam) => void;
  updateIframePosition: ({ message }: AutofillMenuIframeExtensionMessageParam) => void;
  updateMenuHidden: ({ message }: AutofillMenuIframeExtensionMessageParam) => void;
};

interface AutofillMenuIframeService {
  initMenuIframe(initStyles: Partial<CSSStyleDeclaration>, ariaAlert?: string): void;
}

export {
  AutofillMenuIframeExtensionMessage,
  AutofillMenuIframeWindowMessageHandlers,
  BackgroundPortMessageHandlers,
  AutofillMenuIframeService,
};
