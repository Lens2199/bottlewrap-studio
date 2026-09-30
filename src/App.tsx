import { useState } from "react";
import {
  calculateWrapSegment,
  type WrapSegmentGeometry,
} from "./geometry";
import {
  generateWrapOutline,
  type WrapPiece,
} from "./outline";
import { generateWrapPiece } from "./padding";
import {
  calculateBounds,
  generateSvg,
  layoutWrapOutline,
  pointsToString,
  type MeasurementUnit,
} from "./svg";
import "./App.css";

type NumberFieldProps = {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
};

function NumberField({
  label,
  value,
  onChange,
}: NumberFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>

      <input
        type="number"
        step="any"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </label>
  );
}

type SegmentFields = {
  id: string;
  height: string;
  bottomCircumference: string;
};

type SegmentUpdates = Partial<
  Omit<SegmentFields, "id">
>;

type WrapPreviewProps = {
  pieces: WrapPiece[];
};

function WrapPreview({
  pieces,
}: WrapPreviewProps) {
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

  return (
    <svg
      viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
      style={{
        width: "100%",
        height: "auto",
        maxWidth: "800px",
      }}
    >
      {laidOutPieces.map(
        (piece, index) => (
          <g key={index}>
            {piece.bleedOutline !== null && (
              <polygon
                points={pointsToString(
                  piece.bleedOutline,
                )}
                fill="none"
                stroke="red"
                strokeWidth={0.02}
              />
            )}

            <polygon
              points={pointsToString(
                piece.cutOutline,
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.02}
            />
          </g>
        ),
      )}
    </svg>
  );
}

function App() {
  const [unit, setUnit] =
    useState<MeasurementUnit>("in");

  const [
    topCircumference,
    setTopCircumference,
  ] = useState("3.4");

  const [segments, setSegments] = useState<
    SegmentFields[]
  >(() => [
    {
      id: crypto.randomUUID(),
      height: "0.85",
      bottomCircumference: "8.1",
    },
    {
      id: crypto.randomUUID(),
      height: "5.9",
      bottomCircumference: "8.1",
    },
  ]);

  const [bleed, setBleed] =
    useState("0");

  const [seamOverlap, setSeamOverlap] =
    useState("0");

  let geometries: WrapSegmentGeometry[] = [];
  let pieces: WrapPiece[] | null = null;
  let errorMessage: string | null = null;

  function updateSegment(
    id: string,
    updates: SegmentUpdates,
  ) {
    setSegments((currentSegments) =>
      currentSegments.map((segment) =>
        segment.id === id
          ? {
              ...segment,
              ...updates,
            }
          : segment,
      ),
    );
  }

  function addSegment() {
    setSegments((currentSegments) => [
      ...currentSegments,
      {
        id: crypto.randomUUID(),
        height: "",
        bottomCircumference: "",
      },
    ]);
  }

  function removeSegment(id: string) {
    setSegments((currentSegments) => {
      if (currentSegments.length === 1) {
        return currentSegments;
      }

      return currentSegments.filter(
        (segment) => segment.id !== id,
      );
    });
  }

  try {
    const textValues = [
      topCircumference,
      bleed,
      seamOverlap,
      ...segments.flatMap((segment) => [
        segment.height,
        segment.bottomCircumference,
      ]),
    ];

    const hasEmptyField = textValues.some(
      (value) => value.trim() === "",
    );

    if (hasEmptyField) {
      throw new Error(
        "Enter all measurements",
      );
    }

    const numericTopCircumference = Number(
      topCircumference,
    );

    const numericBleed = Number(bleed);

    const numericSeamOverlap = Number(
      seamOverlap,
    );

    const numericValues = [
      numericTopCircumference,
      numericBleed,
      numericSeamOverlap,
      ...segments.flatMap((segment) => [
        Number(segment.height),
        Number(
          segment.bottomCircumference,
        ),
      ]),
    ];

    const hasInvalidNumber =
      numericValues.some(
        (value) => !Number.isFinite(value),
      );

    if (hasInvalidNumber) {
      throw new Error(
        "Enter valid measurements",
      );
    }

    if (numericTopCircumference <= 0) {
      throw new Error(
        "Circumferences must be greater than zero",
      );
    }

    if (
      numericBleed < 0 ||
      numericSeamOverlap < 0
    ) {
      throw new Error(
        "Bleed and seam overlap cannot be negative",
      );
    }

    const calculatedGeometries:
      WrapSegmentGeometry[] = [];

    let currentTopCircumference =
      numericTopCircumference;

    for (const segment of segments) {
      const height = Number(
        segment.height,
      );

      const bottomCircumference = Number(
        segment.bottomCircumference,
      );

      if (height <= 0) {
        throw new Error(
          "Segment heights must be greater than zero",
        );
      }

      if (bottomCircumference <= 0) {
        throw new Error(
          "Circumferences must be greater than zero",
        );
      }

      const geometry =
        calculateWrapSegment({
          topCircumference:
            currentTopCircumference,
          bottomCircumference,
          height,
        });

      calculatedGeometries.push(
        geometry,
      );

      currentTopCircumference =
        bottomCircumference;
    }

    geometries = calculatedGeometries;

    pieces = geometries.map((geometry) => {
      const originalOutline =
        generateWrapOutline(geometry);

      return generateWrapPiece(
        originalOutline,
        geometry,
        numericBleed,
        numericSeamOverlap,
      );
    });
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Invalid measurements";
  }

  function downloadSvg() {
    if (pieces === null) {
      return;
    }

    const svgString = generateSvg(
      pieces,
      unit,
    );

    const blob = new Blob([svgString], {
      type: "image/svg+xml",
    });

    const url = URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = "bottle-wrap.svg";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="app">
      <h1>BottleWrap Studio</h1>

      <div className="workspace">
        <section className="controls">
          <label className="field">
            <span>Measurement unit</span>

            <select
              value={unit}
              onChange={(event) => {
                setUnit(
                  event.target
                    .value as MeasurementUnit,
                );
              }}
            >
              <option value="in">
                Inches
              </option>

              <option value="cm">
                Centimeters
              </option>
            </select>
          </label>

          <NumberField
            label={`Top circumference (${unit})`}
            value={topCircumference}
            onChange={
              setTopCircumference
            }
          />

          <div className="segment-list">
            {segments.map(
              (segment, index) => {
                const segmentTop =
                  index === 0
                    ? topCircumference
                    : segments[index - 1]
                        .bottomCircumference;

                return (
                  <section
                    className="segment"
                    key={segment.id}
                  >
                    <div className="segment-heading">
                      <h2>
                        Segment {index + 1}
                      </h2>

                      <button
                        className="remove-segment"
                        type="button"
                        disabled={
                          segments.length === 1
                        }
                        onClick={() => {
                          removeSegment(
                            segment.id,
                          );
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <p className="segment-top">
                      Top:{" "}
                      {segmentTop || "—"}{" "}
                      {unit}
                    </p>

                    <NumberField
                      label={`Height (${unit})`}
                      value={
                        segment.height
                      }
                      onChange={(
                        newValue,
                      ) => {
                        updateSegment(
                          segment.id,
                          {
                            height:
                              newValue,
                          },
                        );
                      }}
                    />

                    <NumberField
                      label={`Bottom circumference (${unit})`}
                      value={
                        segment.bottomCircumference
                      }
                      onChange={(
                        newValue,
                      ) => {
                        updateSegment(
                          segment.id,
                          {
                            bottomCircumference:
                              newValue,
                          },
                        );
                      }}
                    />
                  </section>
                );
              },
            )}
          </div>

          <button
            className="add-segment"
            type="button"
            onClick={addSegment}
          >
            Add segment
          </button>

          <NumberField
            label={`Bleed (${unit})`}
            value={bleed}
            onChange={setBleed}
          />

          <NumberField
            label={`Seam overlap (${unit})`}
            value={seamOverlap}
            onChange={setSeamOverlap}
          />

          {errorMessage !== null && (
            <p
              className="error"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          {geometries.map(
            (geometry, index) => (
              <p
                className="stat"
                key={segments[index].id}
              >
                Segment {index + 1}{" "}
                sweep:{" "}
                {geometry.sweepAngle ===
                null
                  ? "Straight"
                  : `${geometry.sweepAngle.toFixed(
                      1,
                    )}°`}
              </p>
            ),
          )}
        </section>

        <section className="preview">
          {pieces !== null && (
            <WrapPreview pieces={pieces} />
          )}

          {pieces !== null && (
            <button
              className="download"
              type="button"
              onClick={downloadSvg}
            >
              Download SVG
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;