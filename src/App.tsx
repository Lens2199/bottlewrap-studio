import { useState } from "react";
import { calculateBottleWrap, type BottleWrapOutput } from "./geometry";
import { generateWrapOutline, type WrapOutline } from "./outline";
import {
  calculateBounds,
  generateSvg,
  layoutWrapOutline,
  pointsToString,
} from "./svg";

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label>
      {label}:
      <input
        type="number"
        step="any"
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
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
      : [...laidOutOutline.body, ...laidOutOutline.shoulder];

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
        stroke="black"
        strokeWidth={0.02}
      />

      {laidOutOutline.shoulder !== null && (
        <polygon
          points={pointsToString(laidOutOutline.shoulder)}
          fill="none"
          stroke="black"
          strokeWidth={0.02}
        />
      )}
    </svg>
  );
}

function App() {
  const [inputs, setInputs] = useState({
    bodyCircumference: 8.1,
    neckCircumference: 3.4,
    shoulderHeight: 0.85,
    bodyHeight: 5.9,
    bleed: 0,
    seamOverlap: 0,
  });

  let geometry: BottleWrapOutput | null = null;
  let outline: WrapOutline | null = null;
  let errorMessage: string | null = null;

  try {
    geometry = calculateBottleWrap(inputs);
    outline = generateWrapOutline(geometry);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Invalid bottle measurements";
  }

  function downloadSvg() {
    if (outline === null) {
      return;
    }

    const svgString = generateSvg(outline);

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
    <>
      <h1>BottleWrap Studio</h1>

      <NumberField
        label="Body circumference"
        value={inputs.bodyCircumference}
        onChange={(newValue) => {
          setInputs({
            ...inputs,
            bodyCircumference: newValue,
          });
        }}
      />

      <NumberField
        label="Neck circumference"
        value={inputs.neckCircumference}
        onChange={(newValue) => {
          setInputs({
            ...inputs,
            neckCircumference: newValue,
          });
        }}
      />

      <NumberField
        label="Shoulder height"
        value={inputs.shoulderHeight}
        onChange={(newValue) => {
          setInputs({
            ...inputs,
            shoulderHeight: newValue,
          });
        }}
      />

      <NumberField
        label="Body height"
        value={inputs.bodyHeight}
        onChange={(newValue) => {
          setInputs({
            ...inputs,
            bodyHeight: newValue,
          });
        }}
      />

      <NumberField
        label="Bleed"
        value={inputs.bleed}
        onChange={(newValue) => {
          setInputs({
            ...inputs,
            bleed: newValue,
          });
        }}
      />

      <NumberField
        label="Seam overlap"
        value={inputs.seamOverlap}
        onChange={(newValue) => {
          setInputs({
            ...inputs,
            seamOverlap: newValue,
          });
        }}
      />

      {errorMessage !== null && <p role="alert">{errorMessage}</p>}

      {geometry !== null && (
        <p>Sweep angle: {geometry.sweepAngle ?? "Not applicable"}</p>
      )}

      {outline !== null && <WrapPreview outline={outline} />}

      {outline !== null && (
        <button type="button" onClick={downloadSvg}>
          Download SVG
        </button>
      )}
    </>
  );
}

export default App;
