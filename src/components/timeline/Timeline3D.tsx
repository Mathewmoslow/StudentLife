import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { useScheduleStore } from '../../stores/useScheduleStore';
import * as THREE from 'three';
import styles from './Timeline3D.module.css';

interface EventNodeProps {
  position: [number, number, number];
  task: any;
  color: string;
}

const EventNode: React.FC<EventNodeProps> = ({ position, task, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);
  
  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  const size = 0.2 + (task.priority || 1) * 0.1;
  
  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[size, size, size]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={color} />
      </Box>
      {hovered && (
        <Text
          position={[0, size + 0.3, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {task.title}
        </Text>
      )}
    </group>
  );
};

// Custom spiral curve class
class SpiralCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private scale: number = 1) {
    super();
  }

  getPoint(t: number): THREE.Vector3 {
    const tx = t * this.scale * Math.PI * 8; // 4 full rotations
    const ty = t * 5; // height progression
    const tz = 2 + t * 3; // radius progression
    
    return new THREE.Vector3(
      tz * Math.cos(tx),
      ty,
      tz * Math.sin(tx)
    );
  }
}

const SpiralTimeline: React.FC = () => {
  const { tasks } = useScheduleStore();
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });
  
  const eventPositions = useMemo(() => {
    const sortedTasks = [...tasks].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    
    return sortedTasks.map((task, index) => {
      const progress = index / Math.max(sortedTasks.length - 1, 1);
      const theta = progress * Math.PI * 8; // 4 full rotations
      const radius = 2 + progress * 3;
      const height = progress * 5;
      
      const color = {
        assignment: '#4CAF50',
        exam: '#f44336',
        project: '#2196F3',
        reading: '#FF9800',
        lab: '#9C27B0'
      }[task.type] || '#666';
      
      return {
        position: [
          radius * Math.cos(theta),
          height,
          radius * Math.sin(theta)
        ] as [number, number, number],
        task,
        color
      };
    });
  }, [tasks]);
  
  const spiralCurve = useMemo(() => new SpiralCurve(1), []);
  
  return (
    <group ref={groupRef}>
      {/* Spiral Path */}
      <mesh>
        <tubeGeometry args={[
          spiralCurve,
          100,
          0.05,
          8,
          false
        ]} />
        <meshBasicMaterial color="#333" opacity={0.3} transparent />
      </mesh>
      
      {/* Event Nodes */}
      {eventPositions.map((event, index) => (
        <EventNode key={index} {...event} />
      ))}
    </group>
  );
};

const Timeline3D: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <h2>3D Timeline View</h2>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#4CAF50' }} />
            Assignment
          </span>
          <span className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#f44336' }} />
            Exam
          </span>
          <span className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#2196F3' }} />
            Project
          </span>
          <span className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#FF9800' }} />
            Reading
          </span>
          <span className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#9C27B0' }} />
            Lab
          </span>
        </div>
      </div>
      
      <Canvas camera={{ position: [10, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls enableDamping dampingFactor={0.05} />
        <SpiralTimeline />
      </Canvas>
    </div>
  );
};

export default Timeline3D;