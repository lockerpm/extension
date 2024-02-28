import AutofillMenuIframeElement from "@/content/menu";

const defaultStyles = {
  position: 'absolute',
  minWidth: "300px",
  minHeight: "300px",
  border: "0px",
  padding: "0",
  visibility: "visible",
  boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 16px",
  zIndex: "2147483647",
  display: "block",
  clipPath: "none",
  clip: "auto",
  mask: "none",
  filter: "none",
  pointerEvents: "auto",
  resize: "none",
  borderWidth: "0px",
  borderRadius: "4px",
  margin: "0px",
  opacity: "1",
}

export class AutofillMenuListIframe extends AutofillMenuIframeElement {
  constructor(
  ) {
    super(
      "menu.html",
      "locker-menu-port",
      defaultStyles,
      "locker_menu"
    );
  }
}