type BottleWrapInput = {
  bodyCircumference: number;
  neckCircumference: number;
  shoulderHeight: number;
  bodyHeight: number;
  bleed: number;
  seamOverlap: number;
};

type BottleWrapOutput = {
  bodyCircumference: number;
  bodyHeight: number;
  totalWrapHeight: number;
  innerRadius: number | null;
  outerRadius: number | null;
  sweepAngle: number | null;
};

export function calculateBottleWrap(inputs: BottleWrapInput): BottleWrapOutput {
  // Reject measurements that create a neck wider than the bottle body
  if (inputs.neckCircumference > inputs.bodyCircumference) {
    throw new Error("neck must be smaller than body");
  }
  // Handle a cylindrical bottle by returning a rectangular wrap
  if (inputs.neckCircumference === inputs.bodyCircumference) {
    return {
      bodyCircumference: inputs.bodyCircumference,
      bodyHeight: inputs.bodyHeight,
      totalWrapHeight: inputs.bodyHeight + inputs.shoulderHeight,
      innerRadius: null,
      outerRadius: null,
      sweepAngle: null,
    };
  }
  //  Step 1: Convert the body and neck circumferences into radii
  const bodyRadius = inputs.bodyCircumference / (2 * Math.PI);
  const neckRadius = inputs.neckCircumference / (2 * Math.PI);

  // Step 2: Calculate the horizontal difference between the two radii
  const sideways = bodyRadius - neckRadius;

  // Step 3: Calculate the slanted height of the shoulder
  const slant = Math.sqrt(inputs.shoulderHeight ** 2 + sideways ** 2);

  // Step 4: Calculate the inner radius of the wrap using similar triangles
  const innerRadius = (neckRadius * slant) / sideways;

  // Step 5: Calculate the outer radius by adding the slant to the inner radius
  const outerRadius = innerRadius + slant;

  // Step 6: Calculate the angle needed to draw the wrap
  const sweepAngle =
    (inputs.bodyCircumference / (2 * Math.PI * outerRadius)) * 360;

  // Calculate the total height using the body and shoulder heights
  const totalWrapHeight = inputs.bodyHeight + inputs.shoulderHeight;

  return {
    bodyCircumference: inputs.bodyCircumference,
    bodyHeight: inputs.bodyHeight,
    totalWrapHeight,
    innerRadius,
    outerRadius,
    sweepAngle,
  };
}


