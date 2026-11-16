import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import { useCallback, useEffect, useRef } from 'react';
import { type SharedValue, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { type GraphLink, type NoteGraph, nodeId, noteNodeId, themeNodeId } from './graph';

type SimNode = SimulationNodeDatum & { id: string; charge: number; space: number };
type SimLink = SimulationLinkDatum<SimNode> & Pick<GraphLink, 'score'>;

// Pre-settles a fresh layout so the camera can frame its first frame.
const WARMUP_TICKS = 100;
const FULL_RUN_TICKS = 300;
const REHEAT_ALPHA = 0.3;
const DRAG_ALPHA_TARGET = 0.3;

// Themes repel hard so hubs spread out; notes barely repel so they cluster on their hubs.
const THEME_CHARGE = -700;
const NOTE_CHARGE = -40;
const THEME_SPACE = 30;
const NOTE_SPACE = 6;
// Theme labels and their counts sit under the hub, so wide ones claim more room.
const LABEL_SPACE_PER_CHAR = 6;

// A closer match sits nearer its theme.
function linkDistance(link: SimLink): number {
  return Math.max(36, 80 - 600 * link.score);
}

export type ForceLayout = {
  // x, y pairs in world space, indexed like graph.nodes.
  positions: SharedValue<number[]>;
  drag: (index: number, x: number, y: number) => void;
  release: (index: number) => void;
};

export function useForceLayout(graph: NoteGraph): ForceLayout {
  const reduceMotion = useReducedMotion();
  const positions = useSharedValue<number[]>([]);
  const nodesRef = useRef<SimNode[]>([]);
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null);

  useEffect(() => {
    const previous = new Map(nodesRef.current.map((node) => [node.id, node]));
    const nodes: SimNode[] = graph.nodes.map((node) => {
      const id = nodeId(node);
      const old = previous.get(id);
      const forces =
        node.kind === 'theme'
          ? {
              charge: THEME_CHARGE,
              space: Math.max(THEME_SPACE, (node.label.length + 2) * LABEL_SPACE_PER_CHAR),
            }
          : { charge: NOTE_CHARGE, space: NOTE_SPACE };
      return { id, ...forces, x: old?.x, y: old?.y };
    });
    const links: SimLink[] = graph.links.map((link) => ({
      source: noteNodeId(link.note),
      target: themeNodeId(link.theme),
      score: link.score,
    }));
    const publish = () => {
      positions.value = nodes.flatMap((node) => [node.x ?? 0, node.y ?? 0]);
    };

    const simulation = forceSimulation(nodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(links)
          .id((node) => node.id)
          .distance(linkDistance),
      )
      .force(
        'charge',
        forceManyBody<SimNode>().strength((node) => node.charge),
      )
      .force(
        'collide',
        forceCollide<SimNode>((node) => node.space),
      )
      .force('x', forceX<SimNode>(0).strength(0.06))
      .force('y', forceY<SimNode>(0).strength(0.06))
      .on('tick', publish);

    if (reduceMotion) {
      simulation.stop().tick(FULL_RUN_TICKS);
    } else if (nodes.some((node) => previous.has(node.id))) {
      simulation.alpha(REHEAT_ALPHA);
    } else {
      simulation.tick(WARMUP_TICKS);
    }
    publish();

    nodesRef.current = nodes;
    simulationRef.current = simulation;
    return () => {
      simulation.stop();
    };
  }, [graph, reduceMotion, positions]);

  const drag = useCallback((index: number, x: number, y: number) => {
    const node = nodesRef.current[index];
    if (!node) return;
    node.fx = x;
    node.fy = y;
    simulationRef.current?.alphaTarget(DRAG_ALPHA_TARGET).restart();
  }, []);

  const release = useCallback((index: number) => {
    const node = nodesRef.current[index];
    if (!node) return;
    node.fx = null;
    node.fy = null;
    simulationRef.current?.alphaTarget(0);
  }, []);

  return { positions, drag, release };
}
