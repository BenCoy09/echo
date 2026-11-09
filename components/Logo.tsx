/** Echo mark: a stem and three bars that shorten like a decaying echo. */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" fill="currentColor">
      <rect x="0" y="0" width="22" height="120" />
      <rect x="34" y="0" width="86" height="22" />
      <rect x="34" y="49" width="62" height="22" opacity=".72" />
      <rect x="34" y="98" width="38" height="22" opacity=".44" />
    </svg>
  );
}
