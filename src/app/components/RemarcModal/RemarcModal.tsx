import { ButtonMouseEvent, DivMouseEvent } from "@/models/event.model";
import "./RemarcModal.scss";

export interface RemarcModalFooterButtonConfig {
  text?: string;
  fn?: ButtonMouseEvent;
  loading?: boolean;
  loadingText?: string;
}

export interface RemarcModalProps {
  visible: boolean;
  title?: string;
  children?: JSX.Element[] | JSX.Element;
  size?: "small" | "medium" | "big";
  closable?: boolean;
  onBrackdropClick?: Function;
  acceptButtonConfig?: RemarcModalFooterButtonConfig;
  cancelButtonConfig?: RemarcModalFooterButtonConfig;
}

export function RemarcModal({ 
  title = "", 
  children = [], 
  size = "medium",
  closable = true,
  visible = true,
  onBrackdropClick = (() => {}),
  acceptButtonConfig,
  cancelButtonConfig,
}: RemarcModalProps) {

  const handleContentClick = (e: DivMouseEvent) => {
    e.stopPropagation();
  }

  const handleBackdropClick = (e: DivMouseEvent) => {
    onBrackdropClick();
  }

  const headerEl = (title || closable) ? (
    <div className="remarc-modal__content__header">
      <p className="remarc-modal__content__header__title">
        {title}
      </p>
    </div>
  ) : null;

  const mainClassesList: string[] = [];
  if (visible) mainClassesList.push("visible");
  const mainClasses = mainClassesList.join("");

  let acceptButtonEl: JSX.Element | null = null;
  let cancelButtonEl: JSX.Element | null = null;
  if (acceptButtonConfig) {
    acceptButtonEl = (
      <button onClick={acceptButtonConfig.fn} disabled={acceptButtonConfig.loading} className="button" type="button">
        {acceptButtonConfig.loading && (acceptButtonConfig.loadingText || "Wait...")}
        {!acceptButtonConfig.loading && (acceptButtonConfig.text || "Confirm")}
      </button>
    );
  }
  if (cancelButtonConfig) {
    cancelButtonEl = (
      <button onClick={cancelButtonConfig.fn} disabled={cancelButtonConfig.loading} className="button button-clear" type="button">
        {cancelButtonConfig.loading && (cancelButtonConfig.loadingText || "Wait...")}
        {!cancelButtonConfig.loading && (cancelButtonConfig.text || "Cancel")}
      </button>
    );
  }

  return (
    <div onClick={handleBackdropClick} className={`remarc-modal ${mainClasses}`}>
      <div onClick={handleContentClick} className={`remarc-modal__content ${size}`}>
        {headerEl}
        <div className="remarc-modal__content__body">
          {children}
        </div>
        <div className="remarc-modal__content__footer">
          <div className="remarc-modal__content__footer__buttons">
            {acceptButtonEl}
            {cancelButtonEl}
          </div>
        </div>
      </div>
    </div>
  )
}