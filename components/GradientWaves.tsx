type GradientWavesProps = {
  variant: "full" | "subtle";
};

export function GradientWaves({ variant }: GradientWavesProps) {
  return (
    <div
      className={`gradient-waves gradient-waves--${variant}`}
      aria-hidden="true"
    >
      <div className="wave wave--one" />
      <div className="wave wave--two" />
      <div className="wave wave--three" />
      <div className="wave-grain" />
    </div>
  );
}
