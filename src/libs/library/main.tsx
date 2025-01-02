import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";

const sampleData = {
  nodes: [
    // Central node (Bill)
    { id: 'B1', label: 'Infrastructure Act', type: 'bill', size: 20 },

    // State nodes
    { id: 'CA', label: 'California', type: 'state', party: 'democrat', size: 15 },
    { id: 'TX', label: 'Texas', type: 'state', party: 'republican', size: 15 },
    { id: 'NY', label: 'New York', type: 'state', party: 'democrat', size: 15 },

    // Representative nodes
    { id: 'R1', label: 'Rep. Johnson', type: 'representative', state: 'CA', size: 10 },
    { id: 'R2', label: 'Rep. Smith', type: 'representative', state: 'TX', size: 10 },
    { id: 'R3', label: 'Rep. Davis', type: 'representative', state: 'NY', size: 10 }
  ],
  links: [
    // Bill to Representatives
    { source: 'B1', target: 'R1', value: 1 },
    { source: 'B1', target: 'R2', value: 1 },
    { source: 'B1', target: 'R3', value: 1 },

    // Representatives to States
    { source: 'R1', target: 'CA', value: 1 },
    { source: 'R2', target: 'TX', value: 1 },
    { source: 'R3', target: 'NY', value: 1 }
  ]
};

export function ForceGraph() {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <Card className="w-full h-[80vh] bg-black p-4">
      <div className="w-full h-full relative" ref={svgRef}>
        <svg width={dimensions.width} height={dimensions.height}>
          <g>
            {/* Render links */}
            {sampleData.links.map((link, i) => (
              <line
                key={`link-${i}`}
                className="stroke-gray-600"
                strokeWidth="1"
                x1="50%"
                y1="50%"
                x2="50%"
                y2="50%"
              />
            ))}

            {/* Render nodes */}
            {sampleData.nodes.map((node) => (
              <g key={node.id} transform={`translate(${dimensions.width/2},${dimensions.height/2})`}>
                <circle
                  r={node.size}
                  className={`
                    ${node.type === 'bill' ? 'fill-white' : ''}
                    ${node.type === 'state' && node.party === 'democrat' ? 'fill-blue-500' : ''}
                    ${node.type === 'state' && node.party === 'republican' ? 'fill-red-500' : ''}
                    ${node.type === 'representative' ? 'fill-gray-400' : ''}
                  `}
                />
                <text
                  className="fill-white text-sm"
                  textAnchor="middle"
                  dy=".35em"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-black/50 p-4 rounded-lg">
          <div className="space-y-2 text-white">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white" />
              <span>Bills</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Democratic States</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Republican States</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>Representatives</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}