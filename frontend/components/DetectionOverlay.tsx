"use client";

import { useState } from "react";

type RoboflowDetection = {
  class?: string;
  confidence?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type ImageMeta = { width?: number; height?: number } | null | undefined;

/**
 * Renders the captured fabric image with the defect bounding boxes returned
 * by the Roboflow "fabric-defect-detection" workflow drawn on top of it.
 *
 * Detections use Roboflow's coordinate convention: (x, y) is the CENTER of
 * the box, in pixels relative to the original image dimensions
 * (image_meta.width/height, i.e. raw_result.image_meta). If image_meta is
 * unavailable (e.g. mock results), the box falls back to the image's own
 * natural size once it loads.
 */
export default function DetectionOverlay({
  src,
  alt,
  detections,
  imageMeta,
}: {
  src: string;
  alt: string;
  detections: unknown;
  imageMeta?: unknown;
}) {
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);

  const list = Array.isArray(detections) ? (detections as RoboflowDetection[]) : [];
  const meta = imageMeta && typeof imageMeta === "object" ? (imageMeta as ImageMeta) : null;

  const refWidth = meta?.width || natural?.width;
  const refHeight = meta?.height || natural?.height;

  const boxes = list.filter(
    (detection) =>
      typeof detection.x === "number" &&
      typeof detection.y === "number" &&
      typeof detection.width === "number" &&
      typeof detection.height === "number"
  );

  const canDrawBoxes = Boolean(refWidth && refHeight) && boxes.length > 0;

  // Brand tokens (kept in sync with tailwind config): deep = near-black
  // brand ink, sage = brand accent green.
  const BOX_COLOR = "#0B3B36"; // deep
  const LABEL_BG = "#8FBF9F"; // sage

  return (
    <div className="relative h-full w-full border-[3px] border-deep">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain bg-surface2"
        onLoad={(event) => {
          const img = event.currentTarget;
          setNatural({ width: img.naturalWidth, height: img.naturalHeight });
        }}
      />
      {canDrawBoxes && (
        <svg
          viewBox={`0 0 ${refWidth} ${refHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {boxes.map((detection, index) => {
            const width = detection.width as number;
            const height = detection.height as number;
            const left = (detection.x as number) - width / 2;
            const top = (detection.y as number) - height / 2;
            const strokeWidth = Math.max(refWidth!, refHeight!) * 0.006;
            const fontSize = Math.max(refWidth!, refHeight!) * 0.026;
            const label = `${(detection.class || "defect")}${
              typeof detection.confidence === "number" ? ` ${Math.round(detection.confidence * 100)}%` : ""
            }`;
            const labelPaddingX = fontSize * 0.5;
            const labelHeight = fontSize * 1.6;
            const labelWidth = label.length * fontSize * 0.62 + labelPaddingX * 2;
            const labelY = Math.max(top - labelHeight, 0);

            return (
              <g key={detection.class ? `${detection.class}-${index}` : index}>
                {/* hard offset shadow behind the box, neubrutalist style */}
                <rect
                  x={left + strokeWidth}
                  y={top + strokeWidth}
                  width={width}
                  height={height}
                  fill="none"
                  stroke={BOX_COLOR}
                  strokeOpacity={0.25}
                  strokeWidth={strokeWidth}
                />
                <rect
                  x={left}
                  y={top}
                  width={width}
                  height={height}
                  fill="none"
                  stroke={BOX_COLOR}
                  strokeWidth={strokeWidth}
                />
                {/* solid label chip instead of floating stroked text */}
                <rect
                  x={left}
                  y={labelY}
                  width={labelWidth}
                  height={labelHeight}
                  fill={LABEL_BG}
                  stroke={BOX_COLOR}
                  strokeWidth={strokeWidth * 0.7}
                />
                <text
                  x={left + labelPaddingX}
                  y={labelY + labelHeight * 0.7}
                  fill={BOX_COLOR}
                  fontSize={fontSize}
                  fontWeight={800}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}