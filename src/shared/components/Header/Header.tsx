import { Text, TextSize, TextWeight } from "../Text/index.ts";
import "./Header.css";

type HeaderProps = {
  title: string;
};

const actions = [
  { label: "Buscar", icon: "⌕" },
  { label: "Aplicaciones", icon: "⊞" },
  { label: "Notificaciones", icon: "♧" },
];

export function Header({ title }: HeaderProps) {
  return (
    <header className="header">
      <Text as="h2" size={TextSize.Large} weight={TextWeight.Bold}>
        {title}
      </Text>
      <div className="header__actions" aria-label="Acciones rápidas">
        {actions.map((action) => (
          <button
            key={action.label}
            className="header__action"
            type="button"
            aria-label={action.label}
            title={action.label}
          >
            {action.icon}
          </button>
        ))}
        <span className="header__avatar" aria-label="Perfil">
          FF
        </span>
      </div>
    </header>
  );
}
