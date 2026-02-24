import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Share2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'concept' | 'project' | 'memory' | 'goal';
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

interface KnowledgeGraphProps {
  data: {
    nodes: Node[];
    links: Link[];
  };
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force("link", d3.forceLink<Node, Link>(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = g.append("g")
      .attr("stroke", "rgba(0, 242, 255, 0.1)")
      .attr("stroke-width", 1)
      .selectAll("line")
      .data(data.links)
      .join("line");

    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("circle")
      .attr("r", 8)
      .attr("fill", d => {
        switch(d.type) {
          case 'project': return "#fbbf24";
          case 'goal': return "#a855f7";
          case 'memory': return "#10b981";
          default: return "#00f2ff";
        }
      })
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.label)
      .attr("fill", "rgba(255,255,255,0.6)")
      .attr("font-size", "10px")
      .attr("font-family", "monospace");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="glass-panel p-6 h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-3">
          <Share2 className="text-jarvis-blue" size={20} />
          <h2 className="font-display text-sm uppercase tracking-widest text-jarvis-blue">Neural Knowledge Graph</h2>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-jarvis-blue transition-colors">
            <ZoomIn size={14} />
          </button>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-jarvis-blue transition-colors">
            <ZoomOut size={14} />
          </button>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-jarvis-blue transition-colors">
            <Maximize size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <svg ref={svgRef} className="w-full h-full cursor-move" />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 p-3 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md">
          <LegendItem color="bg-jarvis-blue" label="Concept" />
          <LegendItem color="bg-amber-400" label="Project" />
          <LegendItem color="bg-purple-400" label="Goal" />
          <LegendItem color="bg-emerald-400" label="Memory" />
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{label}</span>
  </div>
);
