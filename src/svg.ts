import type {
  WrapOutline,
  WrapPiece,
} from "./outline";
import type { Point } from "./points";

export type MeasurementUnit = "in" | "cm";

export type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
};

export function pointsToString(
  points: Point[],
): string {
  return points
    .map((point) => {
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

export function calculateBounds(
  points: Point[],
): Bounds {
  if (points.length === 0) {
    throw new Error(
      "Cannot calculate bounds for an empty point list",
    );
  }

  const xValues = points.map(
    (point) => point.x,
  );

  const yValues = points.map(
    (point) => point.y,
  );

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function shiftOutline(
  outline: WrapOutline,
  shiftX: number,
  shiftY: number,
): WrapOutline {
  return outline.map((point) => ({
    x: point.x + shiftX,
    y: point.y + shiftY,
  }));
}

export function layoutWrapOutline(
  pieces: WrapPiece[],
): WrapPiece[] {
  const gap = 0.25;
  const laidOutPieces: WrapPiece[] = [];

  let nextY = 0;

  for (const piece of pieces) {
    const outerOutline =
      piece.bleedOutline ??
      piece.cutOutline;

    const bounds =
      calculateBounds(outerOutline);

    const shiftX = -bounds.minX;
    const shiftY = nextY - bounds.minY;

    const shiftedCutOutline = shiftOutline(
      piece.cutOutline,
      shiftX,
      shiftY,
    );

    const shiftedBleedOutline =
      piece.bleedOutline === null
        ? null
        : shiftOutline(
            piece.bleedOutline,
            shiftX,
            shiftY,
          );

    laidOutPieces.push({
      cutOutline: shiftedCutOutline,
      bleedOutline: shiftedBleedOutline,
    });

    nextY += bounds.height + gap;
  }

  return laidOutPieces;
}

function polygonToSvg(
  outline: WrapOutline,
  stroke: string,
): string {
  const points = pointsToString(outline);

  return `<polygon points="${points}" fill="none" stroke="${stroke}" stroke-width="0.02" />`;
}

export function generateSvg(
  pieces: WrapPiece[],
  unit: MeasurementUnit = "in",
): string {
  if (pieces.length === 0) {
    throw new Error(
      "Cannot generate an SVG without a wrap piece",
    );
  }

  const laidOutPieces =
    layoutWrapOutline(pieces);

  const allPoints = laidOutPieces.flatMap(
    (piece) =>
      piece.bleedOutline === null
        ? piece.cutOutline
        : [
            ...piece.bleedOutline,
            ...piece.cutOutline,
          ],
  );

  const bounds = calculateBounds(allPoints);

  const bleedPolygons = laidOutPieces
    .flatMap((piece) =>
      piece.bleedOutline === null
        ? []
        : [
            polygonToSvg(
              piece.bleedOutline,
              "red",
            ),
          ],
    )
    .join("\n    ");

  const cutPolygons = laidOutPieces
    .map((piece) =>
      polygonToSvg(
        piece.cutOutline,
        "black",
      ),
    )
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg"
  width="${bounds.width}${unit}"
  height="${bounds.height}${unit}"
  viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">
  <g id="bleed">
    ${bleedPolygons}
  </g>
  <g id="cut">
    ${cutPolygons}
  </g>
</svg>`;
}