import { useState } from "react";
import {
  calculateBottleWrap,
  type BottleWrapOutput,
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
  outline: WrapOutline;
};

function WrapPreview({ outline }: WrapPreviewProps) {
  const laidOutOutline = layoutWrapOutline(outline);

  const allPoints =
    laidOutOutline.shoulder === null
      ? laidOutOutline.body
      : [
          ...laidOutOutline.body,
          ...laidOutOutline.shoulder,
        ];

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
      <polygon
        points={pointsToString(laidOutOutline.body)}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.02}
      />

      {laidOutOutline.shoulder !== null && (
        <polygon
          points={pointsToString(laidOutOutline.shoulder)}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.02}
        />
      )}
    </svg>
  );
}

function App() {
  const [unit, setUnit] =
    useState<MeasurementUnit>("in");

  const [inputs, setInputs] = useState({
    bodyCircumference: "8.1",
    neckCircumference: "3.4",
    shoulderHeight: "0.85",
    bodyHeight: "5.9",
    bleed: "0",
    seamOverlap: "0",
  });

  let geometry: BottleWrapOutput | null = null;
  let outline: WrapOutline | null = null;
  let errorMessage: string | null = null;

  try {
    const hasEmptyField = Object.values(inputs).some(
      (value) => value.trim() === "",
    );

    if (hasEmptyField) {
      throw new Error("Enter all measurements");
    }

    const numericInputs = {
      bodyCircumference: Number(inputs.bodyCircumference),
      neckCircumference: Number(inputs.neckCircumference),
      shoulderHeight: Number(inputs.shoulderHeight),
      bodyHeight: Number(inputs.bodyHeight),
      bleed: Number(inputs.bleed),
      seamOverlap: Number(inputs.seamOverlap),
    };

    const hasInvalidNumber = Object.values(
      numericInputs,
    ).some((value) => !Number.isFinite(value));

    if (hasInvalidNumber) {
      throw new Error("Enter valid measurements");
    }

    geometry = calculateBottleWrap(numericInputs);

    const originalOutline =
      generateWrapOutline(geometry);

    outline = applyPadding(
      originalOutline,
      geometry,
      numericInputs.bleed,
      numericInputs.seamOverlap,
    );
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Invalid bottle measurements";
  }

  function downloadSvg() {
    if (outline === null) {
      return;
    }

    const svgString = generateSvg(outline, unit);

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
                  event.target.value as MeasurementUnit,
                );
              }}
            >
              <option value="in">Inches</option>
              <option value="cm">Centimeters</option>
            </select>
          </label>

          <NumberField
            label={`Body circumference (${unit})`}
            value={inputs.bodyCircumference}
            onChange={(newValue) => {
              setInputs({
                ...inputs,
                bodyCircumference: newValue,
              });
            }}
          />

          <NumberField
            label={`Neck circumference (${unit})`}
            value={inputs.neckCircumference}
            onChange={(newValue) => {
              setInputs({
                ...inputs,
                neckCircumference: newValue,
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

          <NumberField
            label={`Body height (${unit})`}
            value={inputs.bodyHeight}
            onChange={(newValue) => {
              setInputs({
                ...inputs,
                bodyHeight: newValue,
              });
            }}
          />

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

          {geometry !== null && (
            <p className="stat">
              Sweep angle:{" "}
              {geometry.sweepAngle === null
                ? "Not applicable"
                : `${geometry.sweepAngle.toFixed(1)}°`}
            </p>
          )}
        </section>

        <section className="preview">
          {outline !== null && (
            <WrapPreview outline={outline} />
          )}

          {outline !== null && (
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