import React from "react";
import Svg, { Path, Circle, Rect, Line } from "react-native-svg";

export type GlyphName = "star" | "dot" | "triangle" | "cross" | "check" | "x" | "lock" | "flame";

interface Props {
  name: GlyphName;
  size?: number;
  color?: string;
}

export function GlyphIcon({ name, size = 16, color = "currentColor" }: Props) {
  const common = { width: size, height: size, viewBox: "0 0 24 24" };

  switch (name) {
    case "star":
      return (
        <Svg {...common}>
          <Path
            d="M12 2.5c.9 3.1 1.9 5.6 3.1 6.9 1.2 1.3 3.4 2.3 6.4 2.6-3 .3-5.2 1.3-6.4 2.6-1.2 1.3-2.2 3.8-3.1 6.9-.9-3.1-1.9-5.6-3.1-6.9-1.2-1.3-3.4-2.3-6.4-2.6 3-.3 5.2-1.3 6.4-2.6 1.2-1.3 2.2-3.8 3.1-6.9z"
            fill={color}
          />
        </Svg>
      );
    case "dot":
      return (
        <Svg {...common}>
          <Circle cx={12} cy={12} r={7} fill={color} />
        </Svg>
      );
    case "triangle":
      return (
        <Svg {...common}>
          <Path d="M12 3.5l8.5 16H3.5L12 3.5z" fill={color} />
        </Svg>
      );
    case "cross":
      return (
        <Svg {...common}>
          <Path d="M10.2 2.5h3.6v7.7h7.7v3.6h-7.7v7.7h-3.6v-7.7H2.5v-3.6h7.7V2.5z" fill={color} />
        </Svg>
      );
    case "check":
      return (
        <Svg {...common} fill="none">
          <Path
            d="M4.5 12.5l5 5L19.5 7.5"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "x":
      return (
        <Svg {...common} fill="none">
          <Path
            d="M6 6l12 12M18 6L6 18"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "lock":
      return (
        <Svg {...common} fill="none">
          <Rect x={5} y={10.5} width={14} height={10} rx={2.2} stroke={color} strokeWidth={2} />
          <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case "flame":
      return (
        <Svg {...common}>
          <Path
            d="M12 2.3c.4 3 2 4.4 3.6 6 1.8 1.8 2.9 3.7 2.9 6.2 0 4.1-3 7.2-6.5 7.2s-6.5-3.1-6.5-7c0-2 .9-3.5 2-4.7.1 1.4.8 2.3 1.7 2.3.9 0 1.4-.8 1.2-1.9-.5-2.6.1-5.6 2.2-8.1-.3 1.3 0 2.3.7 3-.1-1 .1-1.9.7-3z"
            fill={color}
          />
        </Svg>
      );
  }
}
