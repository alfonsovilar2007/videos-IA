import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/ratas/Bridge";
export const Root: React.FC = () => (
  <>
    <Composition id="Ratas" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
