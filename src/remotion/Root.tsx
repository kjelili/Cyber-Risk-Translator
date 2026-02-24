import { Composition } from "remotion";
import { DemoVideoMain } from "./compositions/demo-video/Main";
import { DURATION, FPS, WIDTH, HEIGHT } from "./compositions/demo-video/constants";

export function Root() {
  return (
    <Composition
      id="roc-demo"
      component={DemoVideoMain}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
}
