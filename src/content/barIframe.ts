import AutoSaveBarIframeElement from "@/content/bar";

const defaultStyles = {
  top: '10px',
  right: '10px',
  position: 'fixed',
  width: "400px",
  border: "0px",
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

export class AutoSaveBarIframe extends AutoSaveBarIframeElement {
  constructor(
  ) {
    super(
      "bar.html",
      "locker-bar-port",
      defaultStyles,
      "locker_bar"
    );
  }
}