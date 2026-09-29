export type WrapSegmentInput = {
  topCircumference: number;
  bottomCircumference: number;
  height: number;
};

export type WrapSegmentGeometry = {
  topCircumference: number;
  bottomCircumference: number;
  height: number;
  innerRadius: number | null;
  outerRadius: number | null;
  sweepAngle: number | null;
};

export function calculateWrapSegment(
  inputs: WrapSegmentInput,
): WrapSegmentGeometry {
  const {
    topCircumference,
    bottomCircumference,
    height,
  } = inputs;

  // Equal circumferences create a straight cylindrical segment.
  // Its printable template is a rectangle.
  if (topCircumference === bottomCircumference) {
    return {
      topCircumference,
      bottomCircumference,
      height,
      innerRadius: null,
      outerRadius: null,
      sweepAngle: null,
    };
  }

  // Convert both circumferences into their physical radii.
  const topRadius = topCircumference / (2 * Math.PI);
  const bottomRadius =
    bottomCircumference / (2 * Math.PI);

  // Normalize the measurements so the calculation works
  // regardless of whether the top or bottom is wider.
  const smallerRadius = Math.min(
    topRadius,
    bottomRadius,
  );

  const largerRadius = Math.max(
    topRadius,
    bottomRadius,
  );

  const smallerCircumference = Math.min(
    topCircumference,
    bottomCircumference,
  );

  const largerCircumference = Math.max(
    topCircumference,
    bottomCircumference,
  );

  // Horizontal difference between the two physical radii.
  const sideways = largerRadius - smallerRadius;

  // Slanted height of the tapered segment.
  const slant = Math.sqrt(
    height ** 2 + sideways ** 2,
  );

  // Calculate the radii of the flattened curved band.
  const innerRadius =
    (smallerRadius * slant) / sideways;

  const outerRadius = innerRadius + slant;

  // Calculate the angle occupied by the flattened band.
  const sweepAngle =
    (largerCircumference /
      (2 * Math.PI * outerRadius)) *
    360;

  // This also provides a useful internal check:
  // the inner arc must match the smaller circumference.
  const innerArcLength =
    2 *
    Math.PI *
    innerRadius *
    (sweepAngle / 360);

  if (
    !Number.isFinite(innerArcLength) ||
    smallerCircumference <= 0
  ) {
    throw new Error(
      "Segment circumferences must be positive numbers",
    );
  }

  return {
    topCircumference,
    bottomCircumference,
    height,
    innerRadius,
    outerRadius,
    sweepAngle,
  };
}