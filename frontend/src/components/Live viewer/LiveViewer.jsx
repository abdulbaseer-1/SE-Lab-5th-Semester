import { useRef, useState } from "react";
import styles from "./LiveViewer.module.css";

import { useJitterCursor, /*JitterCursor*/ } from "../Hooks/JitterCursor/useJitterCursor";
import { ColourBlindFilter, ColourBlindFilterSelector } from "../Filters/ColourBlindFilter/ColorFilters";
import { LowVisionComponent, LowVisionFilterSelector } from "../Filters/LowVisionFilter/LowVision";
// import { DyslexiaComponent, DyslexiaFilterSelector } from "../Filters/DyslexiaFilter/DyslexiaFilterSelector";
import { useStreamControls, StreamControls } from "../StreamControls/StreamControls";
import {Glaucoma, GlaucomaComponent} from "../Filters/GlaucomaFilter/Glaucoma";
import {Cataracts, CataractsComponent} from "../Filters/Cataracts/Cataracts";
import {MacularDegeneration, MacularDegenerationComponent} from "../Filters/MacularDegeneration/MacularDegeneration";
import {HardOfHearing, HardOfHearingComponent} from "../Filters/Deafness(HoH)/HardofHearing";

import ClickHandler from "../Hooks/MouseHandler";
import KeyboardHandler from "../Hooks/KeyboardHandler";
import ScanControls from "../ScanDomControls/ScanDomControls";
import ScrollHandler from "../Hooks/ScrollHandler";

export default function LiveViewer(className) {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [jitterEnabled, setJitterEnabled] = useState(false);
  const [jitterIntensity, setJitterIntensity] = useState(2);
  const [colourBlindness, setColourBlindness] = useState("none");
  const [lowVision, setLowVision] = useState(false);
  const [lowVisionIntensity, setLowVisionIntensity] = useState(2);
  // const [dyslexiaEnabled, setDyslexiaEnabled] = useState(false);
  // const [dyslexiaIntensity, setDyslexiaIntensity] = useState(0);
  const [scrollContainer, setScrollContainer] = useState(null);
  const [cataracts, setCataracts] = useState(false);
  const [cataractsIntensity, setCataractsIntensity] =  useState(0);
  const [glaucoma, setGlaucoma] = useState(false);
  const [glaucomaIntensity, setGlaucomaIntensity] = useState(0);
  // NEW ADVANCED SETTINGS:
  const [glaucomaMaskSize, setGlaucomaMaskSize] = useState(60);  // % radius
  const [glaucomaBlur, setGlaucomaBlur] = useState(6);

  const [macularDegeneration, setMacularDegeneration] = useState(false);
  const [macularDegenerationIntensity, setMacularDegenerationIntensity] = useState(0);
  const [hardOfHearing, setHardOfHearing] = useState(false);
  const [hardOfHearingIntensity, setHardOfHearingIntensity] = useState(0);


  const wsRef = useRef(null);
  const frameRef = useRef(null);
  const frameBuffer = useRef([]);

  useJitterCursor(jitterEnabled, jitterIntensity, frameRef);

  const { startStream, stopStream } = useStreamControls({
    url,
    setImage,
    setScanResult,
    setIsStreaming,
    setLoading,
    wsRef,
    frameBuffer,
  });

  return (
    <div className={styles.wrapper}>
      
      {/* 1. LIVE STREAM (Left Side) */}
      {image ? (
        <div ref={setScrollContainer} className={styles.streamContainer}>
          {/* <DyslexiaFilterSelector enabled={dyslexiaEnabled} intensity={dyslexiaIntensity}> */}
            <ColourBlindFilterSelector type={colourBlindness}>
              <LowVisionFilterSelector enabled={lowVision} lowVisionIntensity={lowVisionIntensity}>
                  <Glaucoma enabled={glaucoma} intensity={glaucomaIntensity} maskSize={glaucomaMaskSize} peripheralBlur={glaucomaBlur}>
                    <Cataracts enabled={cataracts} intensity={cataractsIntensity}>
                      <MacularDegeneration enabled={macularDegeneration} intensity={macularDegenerationIntensity}>
                        <HardOfHearing  ws={wsRef.current} enabled={hardOfHearing} intensity={hardOfHearingIntensity}>
                          <img
                            ref={frameRef}
                            src={image}
                            alt="Live Website Stream"
                            className={styles.streamImage}
                          />
                        </HardOfHearing>
                      </MacularDegeneration>
                    </ Cataracts>
                  </Glaucoma>
              </LowVisionFilterSelector>
            </ColourBlindFilterSelector>
          {/* </DyslexiaFilterSelector> */}
        </div>
      ) : (
        <div className={styles.placeholder}>
          <p>{isStreaming ? "Loading live stream..." : "Enter a URL and click Start to begin streaming."}</p>
        </div>
      )}

      {/* 2. CONTROL PANEL (Right Sidebar) */}
      <div className={styles.controlpanel}>
        <div className={styles.sectionTitle}>Stream Controls</div>
        <StreamControls
          url={url}
          setUrl={setUrl}
          isStreaming={isStreaming}
          loading={loading}
          startStream={startStream}
          stopStream={stopStream}
        />
        
        <div className={styles.sectionTitle}>Accessibility Filters</div>
        {isStreaming ? (
          <>
            {/* Jitter Controls (using generic classes for consistent look) */}
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                <input
                  type="checkbox"
                  checked={jitterEnabled}
                  onChange={(e) => setJitterEnabled(e.target.checked)}
                />
                Enable Hand Tremor Simulation
              </label>
              <label className={styles.controlLabel}>
                Jitter Intensity:
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={jitterIntensity}
                  onChange={(e) => setJitterIntensity(Number(e.target.value))}
                />
                <span className={styles.intensityDisplay}>{jitterIntensity}px</span>
              </label>
            </div>

            <ColourBlindFilter
              className={styles.controlGroup}
              colourBlindness={colourBlindness}
              setColourBlindness={setColourBlindness}
            />

            <LowVisionComponent
              className={styles.controlGroup}
              lowVision={lowVision}
              setLowVision={setLowVision}
              lowVisionIntensity={lowVisionIntensity}
              setLowVisionIntensity={setLowVisionIntensity}
            />

            {/* <DyslexiaComponent
              className={styles.controlGroup}
              dyslexiaEnabled={dyslexiaEnabled}
              setDyslexiaEnabled={setDyslexiaEnabled}
              dyslexiaIntensity={dyslexiaIntensity}
              setDyslexiaIntensity={setDyslexiaIntensity}
            /> */}

            <GlaucomaComponent
            className={styles.controlGroup}
            glaucoma={glaucoma}
            setGlaucoma={setGlaucoma}
            glaucomaIntensity={glaucomaIntensity}
            setGlaucomaIntensity={setGlaucomaIntensity}
            glaucomaMaskSize={glaucomaMaskSize}
            setGlaucomaMaskSize={setGlaucomaMaskSize}
            glaucomaBlur={glaucomaBlur}
            setGlaucomaBlur={setGlaucomaBlur}
            />

            <CataractsComponent
              className={styles.controlGroup}
              cataracts={cataracts}
              setCataracts={setCataracts}
              cataractsIntensity={cataractsIntensity}
              setCataractsIntensity={setCataractsIntensity}
            />

            <MacularDegenerationComponent
              className={styles.controlGroup}
              macularDegeneration={macularDegeneration}
              setMacularDegeneration={setMacularDegeneration}
              macularDegenerationIntensity={macularDegenerationIntensity}
              setMacularDegenerationIntensity={setMacularDegenerationIntensity}
            />

            <HardOfHearingComponent
              className={styles.controlGroup}
              hardoOfHearing={hardOfHearing}
              setHardOfHearing={setHardOfHearing}
              hardOfHearingIntensity={hardOfHearingIntensity}
              setHardOfHearingIntensity={setHardOfHearingIntensity}
            />
          </>
        ) : (
          <p className={styles.controlHint}>Start streaming a website to enable filters.</p>
        )}

        <div className={styles.sectionTitle}>Accessibility Scan</div>
        <ScanControls url={url} />
      </div>

      {/* Invisible Logic Handlers */}
      <ClickHandler targetRef={frameRef} wsRef={wsRef} />
      <KeyboardHandler wsRef={wsRef} />
      <ScrollHandler wsRef={wsRef} targetElement={scrollContainer} />
    </div>
  );
}