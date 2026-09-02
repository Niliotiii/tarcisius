import Svg, { Polygon } from "react-native-svg";

interface Props {
  filled: boolean;
}

export function StarIcon({ filled }: Props) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24">
      <Polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={filled ? "#E8B84B" : "none"}
        stroke={filled ? "#E8B84B" : "#D8CBA8"}
        strokeWidth={1.5}
      />
    </Svg>
  );
}
