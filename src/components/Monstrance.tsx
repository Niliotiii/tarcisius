import Svg, { Circle, Line } from "react-native-svg";

interface Props {
  size?: number;
  opacity?: number;
  color?: string;
}

export function Monstrance({ size = 200, opacity = 0.9, color = "#E8B84B" }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.13;
  const rays = 24;

  const rayLines = Array.from({ length: rays }, (_, i) => {
    const angle = (i * 360) / rays - 90;
    const rad = (angle * Math.PI) / 180;
    const isLong = i % 2 === 0;
    const inner = r * 1.35;
    const outer = isLong ? size * 0.48 : size * 0.37;
    return {
      x1: cx + Math.cos(rad) * inner,
      y1: cy + Math.sin(rad) * inner,
      x2: cx + Math.cos(rad) * outer,
      y2: cy + Math.sin(rad) * outer,
      isLong,
    };
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} opacity={opacity}>
      {rayLines.map((l, i) => (
        <Line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={color}
          strokeWidth={l.isLong ? 1.5 : 0.8}
          strokeLinecap="round"
        />
      ))}
      <Circle cx={cx} cy={cy} r={r * 1.2} stroke={color} strokeWidth={1} fill="none" />
      <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={1.5} fill="none" />
      <Circle cx={cx} cy={cy} r={r * 0.45} fill={color} />
      <Line x1={cx} y1={cy - r * 0.7} x2={cx} y2={cy + r * 0.7} stroke="#0F0A27" strokeWidth={1.5} />
      <Line x1={cx - r * 0.5} y1={cy - r * 0.15} x2={cx + r * 0.5} y2={cy - r * 0.15} stroke="#0F0A27" strokeWidth={1.5} />
    </Svg>
  );
}
