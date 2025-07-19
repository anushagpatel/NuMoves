import React, { useState, useRef, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Sky, Cloud, Preload } from "@react-three/drei";

const getSkyColor = () => {
  const currentHour = new Date().getHours();

 if (currentHour >= 22 || currentHour < 4) {
    return {
      topColor: '#000000',     // Dark navy blue
      bottomColor: '#191970',  // Midnight blue
      sunPosition: [0, -0.5, 0],
      cloudColor: '#4F4F4F'    // Dark gray
    };
  }

  // Dawn/Early Morning (4 AM to 6 AM)
  if (currentHour >= 4 && currentHour < 6) {
    return {
      topColor: '#FF7F50',     // Coral
      bottomColor: '#87CEEB',  // Sky blue
      sunPosition: [10, 1, 0],
      cloudColor: '#B0E0E6'    // Powder blue
    };
  }

  // Morning and Daytime (6 AM to 4 PM)
  if (currentHour >= 6 && currentHour < 16) {
    return {
      topColor: '#87CEEB',     // Sky blue
      bottomColor: '#B0E0E6',  // Powder blue
      sunPosition: [100, 10, 100],
      cloudColor: '#F0F8FF'    // Alice Blue (whitish-blue)
    };
  }

  // Late Afternoon/Evening (4 PM to 7 PM)
  if (currentHour >= 16 && currentHour < 19) {
    return {
      topColor: '#FF4500',     // Orange Red
      bottomColor: '#FF6347',  // Tomato
      sunPosition: [10, 10, 0],
      cloudColor: '#E6E6FA'    // Lavender (softer blue)
    };
  }

  // Sunset/Dusk (7 PM to 10 PM)
  return {
    topColor: '#DC143C',       // Crimson
    bottomColor: '#8B0000',    // Dark Red
    sunPosition: [0, 10, 0],
    cloudColor: '#708090'      // Slate gray
  };
};

const CloudScene = () => {
  return (
    <group>
      {/* <Cloud 
        position={[-4, 2, -5]} 
        speed={0.2} 
        opacity={0.7} 
        depth={1} 
        width={10} 
        segments={20} 
      /> */}
      <Cloud 
        position={[4, 1, -3]} 
        speed={0.3} 
        opacity={0.5} 
        depth={1.5} 
        width={8} 
        segments={20} 
      />
      {/* <Cloud 
        position={[0, 3, -4]} 
        speed={0.1} 
        opacity={0.6} 
        depth={1.2} 
        width={12} 
        segments={20} 
      /> */}
    </group>
  );
};

const StarsCanvas = () => {
  // Memoize sky colors to prevent unnecessary re-renders
  const { topColor } = useMemo(() => getSkyColor(), []);
  return (
    <div 
      className='w-full h-auto absolute inset-0 z-[-1]' 
      style={{ 
        backgroundColor: topColor,
        overflow: 'hidden'
      }}
    >
      <Canvas style={{backgroundColor: "#FFFFFF"}} camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* <Sky 
          sunPosition={sunPosition} 
          topColor={topColor}
          bottomColor={bottomColor}
          turbidity={0.1} 
          rayleigh={6} 
          mieCoefficient={0.005} 
          mieDirectionalG={0.95} 
        /> */}

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 10]} 
          intensity={1.5} 
          castShadow 
        />

        <Suspense fallback={null}>
          <CloudScene />
        </Suspense>

        <Preload all />
      </Canvas>
    </div>
  );
};

export default StarsCanvas;


// import React from "react";
// import { Canvas } from "@react-three/fiber";
// import { Cloud, Stars } from "@react-three/drei";

// const StarsCanvas = () => {
//   return (
//     <Canvas
//       style={{ height: "100vh", background: "#FFFFFF" }} // Darkish blue sky background
//       camera={{ position: [0, 0, 10], fov: 75 }}
//     >
//       {/* Add soft white clouds */}
//       <Cloud
//         position={[0, 0, -5]} // Adjust position
//         speed={0.4} // Animation speed
//         opacity={0.5} // Cloud transparency
//       />
//       <Cloud
//         position={[-4, 2, -5]} 
//         speed={0.6}
//         opacity={0.4}
//       />
//       <Cloud
//         position={[4, -2, -5]} 
//         speed={0.5}
//         opacity={0.6}
//       />
      
//       {/* Add stars in the background */}
//       <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
//     </Canvas>
//   );
// };

// export default StarsCanvas;
