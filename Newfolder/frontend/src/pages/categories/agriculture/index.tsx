import React from 'react';
import Navbar from '../../../components/Navbar';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  'Cereals',
  'Legumes',
  'Oilseeds',
  'Sugar Crops',
  'Fruits',
  'Vegetables',
  'Roots',
  'Nuts',
  'Spices',
  'Fiber',
  'Beverages',
  'Forage',
  'Green Manure',
  'Plantation',
];

const colors = [
  '#F9D976', '#E2B04A', '#C96A4A', '#4B5F3C', '#66BB6A', '#42A5F5', '#AB47BC', '#26A69A', '#EC407A', '#7E57C2', '#5D4037', '#7EC8E3', '#9CCC65', '#FFA726'
];

function getArcPath(cx: number, cy: number, r1: number, r2: number, startAngle: number, endAngle: number) {
  // Convert angles to radians
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);
  // Points on outer arc
  const x1 = cx + r2 * Math.cos(startRad);
  const y1 = cy + r2 * Math.sin(startRad);
  const x2 = cx + r2 * Math.cos(endRad);
  const y2 = cy + r2 * Math.sin(endRad);
  // Points on inner arc
  const x3 = cx + r1 * Math.cos(endRad);
  const y3 = cy + r1 * Math.sin(endRad);
  const x4 = cx + r1 * Math.cos(startRad);
  const y4 = cy + r1 * Math.sin(startRad);
  // Large arc flag
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${r2} ${r2} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${r1} ${r1} 0 ${largeArc} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

const wedgeDescriptions = [
  'Cereals: Staple crops like wheat, rice, and corn.',
  'Legumes: Protein-rich beans, lentils, and peas.',
  'Oilseeds: Sunflower, soybean, and canola for oils.',
  'Sugar Crops: Sugarcane and sugar beet.',
  'Fruits: Apples, bananas, mangoes, and more.',
  'Vegetables: Leafy greens, roots, and more.',
  'Roots: Potatoes, carrots, and similar crops.',
  'Nuts: Almonds, walnuts, and peanuts.',
  'Spices: Pepper, cardamom, and other flavorings.',
  'Fiber: Cotton, jute, and hemp for textiles.',
  'Beverages: Tea, coffee, and cocoa.',
  'Forage: Crops for animal feed.',
  'Green Manure: Crops to enrich soil.',
  'Plantation: Rubber, coconut, and palm oil.',
];

const bgPattern = `url('data:image/svg+xml;utf8,<svg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><rect x=\'0\' y=\'0\' width=\'60\' height=\'60\' fill=\'%23e6f9ed\'/><path d=\'M30 0 Q35 15 60 30 Q45 35 30 60 Q25 45 0 30 Q15 25 30 0 Z\' fill=\'%23d6f5e3\' fill-opacity=\'0.18\'/></svg>')`;

const AgricultureCategory: React.FC = () => {
  const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  const [hovered, setHovered] = React.useState<number | null>(null);
  React.useEffect(() => {
    function updateSize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Responsive SVG: use a fixed viewBox and scale SVG to container
  const viewBoxSize = 700;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;
  const outerRadius = viewBoxSize * 0.45;
  const innerRadius = viewBoxSize * 0.25;
  const angleStep = 360 / sections.length;
  const gap = 2; // degrees

  const agricultureImage = 'https://i.pinimg.com/1200x/9a/43/f5/9a43f5309d7614968fe6d71eed159520.jpg';

  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; text: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main
        className="flex flex-col items-center justify-center py-12 px-4"
        style={{ background: `${bgPattern}, #f8fafc` }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-10 mt-4 text-center">Agriculture</h1>
        <div style={{ width: '100%', maxWidth: 700, boxShadow: '0 8px 32px 0 rgba(34,139,34,0.10), 0 1.5px 8px 0 rgba(34,139,34,0.08)', borderRadius: 32, background: 'white' }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            width="100%"
            height="auto"
            style={{ display: 'block', background: 'none', borderRadius: 32 }}
          >
            <defs>
              <clipPath id="agriClip">
                <circle cx={cx} cy={cy} r={innerRadius * 0.95} />
              </clipPath>
            </defs>
            {/* Colored ring behind wedges */}
            <circle cx={cx} cy={cy} r={(outerRadius + innerRadius) / 2} fill="none" stroke="#d6f5e3" strokeWidth={outerRadius - innerRadius + 8} />
            {sections.map((section, i) => {
              const startAngle = i * angleStep + gap / 2;
              const endAngle = (i + 1) * angleStep - gap / 2;
              const path = getArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle);
              // Place text at the middle angle, halfway between inner and outer radius
              const midAngle = (startAngle + endAngle) / 2;
              const midRad = (midAngle - 90) * (Math.PI / 180);
              const textRadius = (innerRadius + outerRadius) / 2;
              const textX = cx + textRadius * Math.cos(midRad);
              const textY = cy + textRadius * Math.sin(midRad);
              const isHovered = hovered === i;
              const scale = isHovered ? 1.07 : 1;
              // Pull out effect: move wedge outward along its mid-angle when hovered
              const pullDistance = isHovered ? 16 : 0;
              const dx = pullDistance * Math.cos(midRad);
              const dy = pullDistance * Math.sin(midRad);
              // For Framer Motion: animate x/y (pull out) and scale (grow)
              return (
                <motion.g
                  key={section}
                  onMouseEnter={e => {
                    setHovered(i);
                    if (svgRef.current) {
                      const rect = svgRef.current.getBoundingClientRect();
                      setTooltip({
                        x: ((textX / viewBoxSize) * rect.width) + rect.left,
                        y: ((textY / viewBoxSize) * rect.height) + rect.top - 40,
                        text: wedgeDescriptions[i],
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                    setTooltip(null);
                  }}
                  style={{ cursor: 'pointer', filter: isHovered ? 'drop-shadow(0 0 12px #7ec8a3)' : 'none', transition: 'filter 0.2s' }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ scale: mounted ? scale : 0, x: dx, y: dy }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.5, delay: mounted ? i * 0.02 : 0 }}
                >
                  <path d={path} fill={colors[i % colors.length]} opacity={isHovered ? 1 : 0.95} />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize={Math.min(viewBoxSize, viewBoxSize) * 0.022}
                    fill="#fff"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none', textShadow: '0 1px 4px #0008' }}
                  >
                    {section}
                  </text>
                </motion.g>
              );
            })}
            {/* Center circle with image only */}
            <circle cx={cx} cy={cy} r={innerRadius * 0.95} fill="#fff" />
            <image
              href={agricultureImage}
              x={cx - innerRadius * 0.95}
              y={cy - innerRadius * 0.95}
              width={innerRadius * 1.9}
              height={innerRadius * 1.9}
              clipPath="url(#agriClip)"
              style={{ pointerEvents: 'none' }}
              preserveAspectRatio="xMidYMid slice"
            />
          </svg>
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: 'fixed',
                  left: tooltip.x,
                  top: tooltip.y,
                  zIndex: 100,
                  pointerEvents: 'none',
                  background: 'rgba(255,255,255,0.98)',
                  color: '#256029',
                  borderRadius: 8,
                  boxShadow: '0 2px 12px 0 rgba(34,139,34,0.10)',
                  minWidth: 180,
                  minHeight: 48,
                  maxWidth: 260,
                  padding: '14px 20px',
                  whiteSpace: 'normal',
                  border: '1px solid #d6f5e3',
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {tooltip.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AgricultureCategory; 