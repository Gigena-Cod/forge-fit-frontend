import {
  Text,
  TextColor,
  TextSize,
  TextWeight,
} from "../../../../shared/components/Text/index.ts";

export function LoginVisualPanel() {
  return (
    <section className="login-visual-panel">
      <div className="login-brand">
        <span className="login-brand__mark" aria-hidden="true">
          FF
        </span>
        <Text as="span" size={TextSize.Large} weight={TextWeight.ExtraBold}>
          ForgeFit
        </Text>
      </div>

      <div className="login-visual-panel__content">
        <div className="login-visual-panel__art" aria-hidden="true">
          <span className="login-visual-panel__plate login-visual-panel__plate--left" />
          <span className="login-visual-panel__bar" />
          <span className="login-visual-panel__plate login-visual-panel__plate--right" />
          <span className="login-visual-panel__line login-visual-panel__line--top" />
          <span className="login-visual-panel__line login-visual-panel__line--bottom" />
        </div>
        <Text as="h1" size={TextSize.XXLarge} weight={TextWeight.ExtraBold}>
          Gestioná tu gimnasio desde un solo lugar.
        </Text>
        <Text size={TextSize.Large} color={TextColor.Secondary}>
          Administrá socios, pagos y asistencias de forma simple y centralizada.
        </Text>
      </div>

      <Text
        className="login-visual-panel__footer"
        size={TextSize.Small}
        color={TextColor.Secondary}
      >
        © 2026 ForgeFit
      </Text>
    </section>
  );
}
