import React from "react";

type CircularProgressProps = {
  size?: number; // диаметр круга
  strokeWidth?: number; // ширина кольца
  progress: number; // от 0 до 100
  color?: string;
  trackColor?: string;
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 20,
  strokeWidth = 4,
  progress,
  color = "#60a5fa", // голубой
  trackColor = "#444", // тёмно-серый
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);

  return (
    <svg height={size} width={size}>
      <circle cx={size / 2} cy={size / 2} fill="transparent" r={radius} stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        r={radius}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};
