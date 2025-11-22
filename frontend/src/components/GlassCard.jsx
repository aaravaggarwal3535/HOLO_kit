import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshTransmissionMaterial, Text, Environment, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef } from 'react';

export default function GlassCard({ data, visible }) {
  
  if (!visible || !data) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 bg-dark-900"
    >
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#0A0A0F']} />
        
        {/* Stars background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
        <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.8} color="#B026FF" />
        <pointLight position={[0, 5, 5]} intensity={0.8} color="#00D4FF" />
        
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* The Glass Card */}
        <Float
          speed={1.5}
          rotationIntensity={0.4}
          floatIntensity={0.6}
        >
          <CardMesh data={data} />
        </Float>
        
        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          minDistance={4}
          maxDistance={10}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
            <span className="text-xl">🔮</span>
          </div>
          <div>
            <p className="text-white font-bold text-lg">Holo-Kit</p>
            <p className="text-gray-500 text-xs">Live Media Kit</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 glass-strong rounded-full text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
          >
            <span>← New Search</span>
          </button>
        </motion.div>
      </div>
      
      {/* Bottom Info Section */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-6xl px-8"
      >
        <div className="glass-strong rounded-2xl p-8 border border-white/10">
          {/* Creator Name Header */}
          <div className="text-center mb-6 pb-6 border-b border-white/10">
            <h2 className="text-4xl font-bold gradient-text mb-2">{data.channel_name}</h2>
            <div className="flex items-center justify-center gap-3">
              <span className="px-4 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full text-sm font-semibold border border-neon-cyan/30">
                {data.platform === 'youtube' ? '🎥 YouTube Creator' : 
                 data.platform === 'instagram' ? '📸 Instagram Creator' :
                 '💻 GitHub Developer'}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">Live Data • Verified</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Content */}
            {data.top_content && data.top_content.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-neon-purple flex items-center gap-2">
                  <span>🔥</span> Top Content
                </h3>
                <div className="space-y-2">
                  {data.top_content.slice(0, 3).map((item, index) => (
                    <div key={index} className="glass rounded-lg p-3 border border-white/5">
                      <p className="text-white text-sm font-medium line-clamp-1">{item.title}</p>
                      {item.view_count && (
                        <p className="text-gray-400 text-xs mt-1">
                          👁️ {item.view_count.toLocaleString()} views
                        </p>
                      )}
                      {item.stars !== undefined && (
                        <p className="text-gray-400 text-xs mt-1">
                          ⭐ {item.stars.toLocaleString()} stars
                        </p>
                      )}
                      {item.likes !== undefined && (
                        <p className="text-gray-400 text-xs mt-1">
                          ❤️ {item.likes.toLocaleString()} likes • 💬 {item.comments?.toLocaleString() || 0} comments
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Full Summary */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-lg font-bold text-neon-blue flex items-center gap-2">
                <span>📊</span> Complete Analysis
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                {data.content_summary}
              </p>
              
              {data.about && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-neon-cyan mb-2">About</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {data.about}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardMesh({ data }) {
  const meshRef = useRef();

  return (
    <group>
      {/* Main Glass Card */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[3.5, 4.5, 0.15]} />
        <MeshTransmissionMaterial
          transmission={0.98}
          thickness={0.3}
          roughness={0.05}
          chromaticAberration={0.06}
          anisotropy={0.3}
          distortion={0.3}
          distortionScale={0.4}
          temporalDistortion={0.2}
          clearcoat={1}
          attenuationDistance={0.8}
          attenuationColor="#ffffff"
          color="#00D4FF"
          ior={1.5}
        />
      </mesh>
      
      {/* Inner glow card */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[3.2, 4.2, 0.01]} />
        <meshBasicMaterial color="#00D4FF" opacity={0.1} transparent />
      </mesh>
      
      {/* Reach Label */}
      <Text
        position={[0, 1.5, 0.08]}
        fontSize={0.14}
        color="#888888"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        letterSpacing={0.05}
      >
        REACH
      </Text>
      
      {/* Subscribers/Followers Count */}
      <Text
        position={[0, 1.05, 0.08]}
        fontSize={0.45}
        color="#00D4FF"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        outlineWidth={0.012}
        outlineColor="#000000"
      >
        {data.subscribers}
      </Text>
      
      {/* Divider Line 1 */}
      <mesh position={[0, 0.65, 0.08]}>
        <boxGeometry args={[2.8, 0.008, 0.01]} />
        <meshBasicMaterial color="#00D4FF" opacity={0.3} transparent />
      </mesh>
      
      {/* Category Label */}
      <Text
        position={[0, 0.35, 0.08]}
        fontSize={0.14}
        color="#888888"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        letterSpacing={0.05}
      >
        CATEGORY
      </Text>
      
      {/* Content Descriptor/Category */}
      <Text
        position={[0, -0.05, 0.08]}
        fontSize={0.32}
        color="#B026FF"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {data.content_descriptor}
      </Text>
      
      {/* Divider Line 2 */}
      <mesh position={[0, -0.45, 0.08]}>
        <boxGeometry args={[2.8, 0.008, 0.01]} />
        <meshBasicMaterial color="#B026FF" opacity={0.3} transparent />
      </mesh>
      
      {/* Summary Label */}
      <Text
        position={[0, -0.75, 0.08]}
        fontSize={0.14}
        color="#888888"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        letterSpacing={0.05}
      >
        SUMMARY
      </Text>
      
      {/* Short Summary */}
      <Text
        position={[0, -1.35, 0.08]}
        fontSize={0.13}
        color="#DDDDDD"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
        lineHeight={1.4}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        outlineWidth={0.003}
        outlineColor="#000000"
      >
        {data.content_summary.substring(0, 150)}...
      </Text>
      
      {/* Platform Badge - Top Right */}
      <mesh position={[1.4, 2, 0.08]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial 
          color={
            data.platform === 'youtube' ? '#FF0000' : 
            data.platform === 'instagram' ? '#E4405F' : 
            '#6e5494'
          } 
          opacity={0.9} 
          transparent 
        />
      </mesh>
      <Text
        position={[1.4, 2, 0.09]}
        fontSize={0.18}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {data.platform === 'youtube' ? '🎥' : data.platform === 'instagram' ? '📸' : '💻'}
      </Text>
      
      {/* Verified Badge - Top Left */}
      <mesh position={[-1.4, 2, 0.08]}>
        <circleGeometry args={[0.18, 32]} />
        <meshBasicMaterial color="#00FFF5" opacity={0.9} transparent />
      </mesh>
      <Text
        position={[-1.4, 2, 0.09]}
        fontSize={0.14}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        ✓
      </Text>
    </group>
  );
}
