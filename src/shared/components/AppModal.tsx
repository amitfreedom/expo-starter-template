import { Overlay, type OverlayProps } from "./overlays/Overlay";
export type AppModalProps = Omit<
  OverlayProps,
  "placement" | "alert" | "handle" | "translateY"
>;
export function AppModal(props: AppModalProps) {
  return <Overlay {...props} />;
}
