type PasswordVisibilityIconProps = {
  isVisible: boolean;
};

export function PasswordVisibilityIcon({
  isVisible,
}: PasswordVisibilityIconProps) {
  return isVisible ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9.2 5.1 9.8 7.1a10.8 10.8 0 0 1-3.3 4.5" />
      <path d="M6.6 6.6A10.9 10.9 0 0 0 2.2 12c.6 2 4.3 7.1 9.8 7.1 1 0 1.9-.2 2.8-.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.2 12S5.9 4.9 12 4.9 21.8 12 21.8 12 18.1 19.1 12 19.1 2.2 12 2.2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}
