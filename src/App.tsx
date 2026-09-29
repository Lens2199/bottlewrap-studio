import { useState } from "react";
import {
  calculateWrapSegment,
  type WrapSegmentGeometry,
} from "./geometry";
import {
  generateWrapOutline,
  type WrapOutline,
} from "./outline";
import { applyPadding } from "./padding";
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

type WrapPreviewProps = {
  outlines: WrapOutline[];
};

function WrapPreview({
  outlines,
}: WrapPreviewProps) {
  const laidOutOutlines =
    layoutWrapOutline(outlines);

  const allPoints = laidOutOutlines.flat();

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
      {laidOutOutlines.map((outline, index) => (
        <polygon
          key={index}
          points={pointsToString(outline)}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.02}
        />
      ))}
    </svg>
  );
}

function App() {
  const [unit, setUnit] =
    useState<MeasurementUnit>("in");

  const [hasShoulder, setHasShoulder] =
    useState(true);

  const [inputs, setInputs] = useState({
    topCircumference: "8.1",
    bottomCircumference: "8.1",
    height: "5.9",
    neckCircumference: "3.4",
    shoulderHeight: "0.85",
    bleed: "0",
    seamOverlap: "0",
  });

  let geometries: WrapSegmentGeometry[] = [];
  let outlines: WrapOutline[] | null = null;
  let errorMessage: string | null = null;

  try {
    const requiredValues = [
      inputs.topCircumference,
      inputs.bottomCircumference,
      inputs.height,
      inputs.bleed,
      inputs.seamOverlap,
    ];

    if (hasShoulder) {
      requiredValues.push(
        inputs.neckCircumference,
        inputs.shoulderHeight,
      );
    }

    const hasEmptyField = requiredValues.some(
      (value) => value.trim() === "",
    );

    if (hasEmptyField) {
      throw new Error("Enter all measurements");
    }

    const topCircumference = Number(
      inputs.topCircumference,
    );

    const bottomCircumference = Number(
      inputs.bottomCircumference,
    );

    const height = Number(inputs.height);
    const bleed = Number(inputs.bleed);
    const seamOverlap = Number(
      inputs.seamOverlap,
    );

    const requiredNumbers = [
      topCircumference,
      bottomCircumference,
      height,
      bleed,
      seamOverlap,
    ];

    const hasInvalidNumber = requiredNumbers.some(
      (value) => !Number.isFinite(value),
    );

    if (hasInvalidNumber) {
      throw new Error("Enter valid measurements");
    }

    if (
      topCircumference <= 0 ||
      bottomCircumference <= 0 ||
      height <= 0
    ) {
      throw new Error(
        "Circumferences and height must be greater than zero",
      );
    }

    if (bleed < 0 || seamOverlap < 0) {
      throw new Error(
        "Bleed and seam overlap cannot be negative",
      );
    }

    const bodyGeometry = calculateWrapSegment({
      topCircumference,
      bottomCircumference,
      height,
    });

    geometries = [bodyGeometry];

    if (hasShoulder) {
      const neckCircumference = Number(
        inputs.neckCircumference,
      );

      const shoulderHeight = Number(
        inputs.shoulderHeight,
      );

      if (
        !Number.isFinite(neckCircumference) ||
        !Number.isFinite(shoulderHeight)
      ) {
        throw new Error("Enter valid measurements");
      }

      if (
        neckCircumference <= 0 ||
        shoulderHeight <= 0
      ) {
        throw new Error(
          "Neck circumference and shoulder height must be greater than zero",
        );
      }

      const shoulderGeometry =
        calculateWrapSegment({
          topCircumference: neckCircumference,
          bottomCircumference:
            topCircumference,
          height: shoulderHeight,
        });

      geometries.push(shoulderGeometry);
    }

    outlines = geometries.map((geometry) => {
      const originalOutline =
        generateWrapOutline(geometry);

      return applyPadding(
        originalOutline,
        geometry,
        bleed,
        seamOverlap,
      );
    });
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Invalid measurements";
  }

  function downloadSvg() {
    if (outlines === null) {
      return;
    }

    const svgString = generateSvg(
      outlines,
      unit,
    );

    const blob = new Blob([svgString], {
      type: "image/svg+xml",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
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
              <option value="in">Inches</option>
              <option value="cm">
                Centimeters
              </option>
            </select>
          </label>

          <NumberField
            label={`Top circumference (${unit})`}
            value={inputs.topCircumference}
            onChange={(newValue) => {
              setInputs({
                ...inputs,
                topCircumference: newValue,
              });
            }}
          />

          <NumberField
            label={`Bottom circumference (${unit})`}
            value={
              inputs.bottomCircumference
            }
            onChange={(newValue) => {
              setInputs({
                ...inputs,
                bottomCircumference: newValue,
              });
            }}
          />

          <NumberField
            label={`Height (${unit})`}
            value={inputs.height}
            onChange={(newValue) => {
              setInputs({
                ...inputs,
                height: newValue,
              });
            }}
          />

          <label className="field">
            <span>Add shoulder/neck section</span>

            <input
              type="checkbox"
              checked={hasShoulder}
              onChange={(event) => {
                setHasShoulder(
                  event.target.checked,
                );
              }}
            />
          </label>

          {hasShoulder && (
            <>
              <NumberField
                label={`Neck circumference (${unit})`}
                value={
                  inputs.neckCircumference
                }
                onChange={(newValue) => {
                  setInputs({
                    ...inputs,
                    neckCircumference:
                      newValue,
                  });
                }}
              />

              <NumberField
                label={`Shoulder height (${unit})`}
                value={inputs.shoulderHeight}
                onChange={(newValue) => {
                  setInputs({
                    ...inputs,
                    shoulderHeight: newValue,
                  });
                }}
              />
            </>
          )}

          <NumberField
            label={`Bleed (${unit})`}
            value={inputs.bleed}
            onChange={(newValue) => {
              setInputs({
                ...inputs,
                bleed: newValue,
              });
            }}
          />

          <NumberField
            label={`Seam overlap (${unit})`}
            value={inputs.seamOverlap}
            onChange={(newValue) => {
              setInputs({
                ...inputs,
                seamOverlap: newValue,
              });
            }}
          />

          {errorMessage !== null && (
            <p className="error" role="alert">
              {errorMessage}
            </p>
          )}

          {geometries.map(
            (geometry, index) => (
              <p
                className="stat"
                key={index}
              >
                {index === 0
                  ? "Body"
                  : "Shoulder"}{" "}
                sweep angle:{" "}
                {geometry.sweepAngle === null
                  ? "Not applicable"
                  : `${geometry.sweepAngle.toFixed(
                      1,
                    )}°`}
              </p>
            ),
          )}
        </section>

        <section className="preview">
          {outlines !== null && (
            <WrapPreview
              outlines={outlines}
            />
          )}

          {outlines !== null && (
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