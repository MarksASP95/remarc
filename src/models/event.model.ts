import { MouseEvent, MouseEventHandler } from "react";

export type DivMouseEvent = MouseEvent<HTMLDivElement, globalThis.MouseEvent>
export type ButtonMouseEvent = MouseEventHandler<HTMLButtonElement>;