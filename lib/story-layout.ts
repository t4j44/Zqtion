export type StoryPoint = readonly [x: number, y: number, rotation: number, scaleX: number, scaleY: number];
const fragments: StoryPoint[] = [
  [-110,-88,-14,1.3,1.8],[-28,-98,8,1,1.1],[65,-80,-8,1.5,1.9],[126,-12,14,.8,1.2],
  [-114,25,9,1,1.4],[-53,75,-12,1.4,1.7],[45,83,7,1.6,1.5],[112,77,-9,.8,.8],
  [-35,-22,-4,1.5,2.2],[53,10,10,1.2,1.5],[-116,-26,-22,.7,.8],[15,-125,16,.5,.6],[9,125,-5,.7,.6],
];
const product: StoryPoint[] = [
  [0,-108,0,4.9,.6],[-116,-3,0,.65,4.4],[-27,-32,0,2.3,2.2],[87,-55,0,1.5,.9],
  [87,-8,0,1.5,1.3],[-47,61,0,1.5,1.4],[47,61,0,1.5,1.4],[0,111,0,4.9,.3],
  [-72,-77,0,.6,.15],[-22,-77,0,.9,.15],[49,-77,0,1.1,.15],[-44,5,0,1.4,.15],[6,5,0,.25,.15],
];
const workflow: StoryPoint[] = [
  [-111,-83,0,.95,.9],[0,-83,0,.95,.9],[111,-83,0,.95,.9],[-111,0,0,.95,.9],
  [0,0,0,1.3,1.3],[111,0,0,.95,.9],[-111,83,0,.95,.9],[0,83,0,.95,.9],
  [111,83,0,.95,.9],[-56,-42,0,.3,.4],[56,-42,0,.3,.4],[-56,42,0,.3,.4],[56,42,0,.3,.4],
];
const mark: StoryPoint[] = [
  [-90,-76,0,1.04,.7],[-30,-76,0,1.04,.7],[30,-76,0,1.04,.7],[90,-76,0,1.04,.7],
  [-90,76,0,1.04,.7],[-30,76,0,1.04,.7],[30,76,0,1.04,.7],[90,76,0,1.04,.7],
  [90,-43,-26,1.04,.7],[45,-22,-26,1.04,.7],[0,0,-26,1.04,.7],[-45,22,-26,1.04,.7],[-90,43,-26,1.04,.7],
];
export const storyLayouts = [fragments, product, workflow, mark] as const;

export function storyPoint(progress: number, index: number): StoryPoint {
  const clamped = Math.max(0, Math.min(3, Number.isFinite(progress) ? progress : 0));
  const start = Math.min(2, Math.floor(clamped));
  const blend = clamped - start;
  const eased = blend * blend * (3 - 2 * blend);
  const a = storyLayouts[start][index];
  const b = storyLayouts[start + 1][index];
  return a.map((value, axis) => value + (b[axis] - value) * eased) as unknown as StoryPoint;
}
