import "./RemarcModal.scss";
import { MouseEvent } from "react";

export interface RemarcModalProps {
  visible: boolean;
  title?: string;
  children?: JSX.Element[] | JSX.Element;
  size?: "small" | "medium" | "big";
  closable?: boolean;
  onBrackdropClick?: Function;
}

type DivMouseEvent = MouseEvent<HTMLDivElement, globalThis.MouseEvent>

export function RemarcModal({ 
  title = "", 
  children = [], 
  size = "medium",
  closable = true,
  visible = true,
  onBrackdropClick = (() => {}),
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

  return (
    <div onClick={handleBackdropClick} className={`remarc-modal ${mainClasses}`}>
        <div onClick={handleContentClick} className={`remarc-modal__content ${size}`}>
          {headerEl}
          <div className="remarc-modal__content__body">
            {children}
          </div>
        </div>
    </div>
  )
}