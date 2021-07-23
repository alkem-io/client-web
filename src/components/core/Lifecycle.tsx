import * as d3 from 'd3';
import React, { FC, MutableRefObject, useCallback } from 'react';
import { createMachine } from 'xstate';
import { toDirectedGraph } from '@xstate/graph';
import { Lifecycle } from '../../types/graphql-schema';
import { Theme } from '../../context/ThemeProvider';
import { useTheme } from '../../hooks/useTheme';

export interface GraphThemeOptions {
  strokePrimaryColor?: string;
  strokeDefaultColor?: string;
  fillColor?: string;
  font?: string;
  fontSize?: number;
}

interface Props {
  lifecycle: Lifecycle;
  options?: GraphThemeOptions;
}

const LifecycleVisualizer: FC<Props> = ({ lifecycle, options }) => {
  const theme = useTheme().theme;
  const divRef = useCallback(
    svgRef => {
      if (lifecycle) {
        buildGraph(svgRef, lifecycle, theme, options);
      }
    },
    [lifecycle]
  );

  return <svg id="graph-container" className="col-7" ref={divRef} />;
};

const buildGraph = (
  ref: MutableRefObject<SVGSVGElement>,
  lifecycle: Lifecycle,
  theme: Theme,
  options?: GraphThemeOptions
) => {
  if (!lifecycle) {
    return undefined;
  }

  const graphThemeDefaults: GraphThemeOptions = {
    strokePrimaryColor: theme.palette.primary,
    strokeDefaultColor: '#000',
    fillColor: theme.palette.background,
    font: theme.typography.button.font,
    fontSize: theme.typography.button.size,
  };

  options = { ...graphThemeDefaults, ...options };

  _buildGraph(ref, lifecycle, options);
};

const _buildGraph = (ref: MutableRefObject<SVGSVGElement>, lifecycle: Lifecycle, options: GraphThemeOptions) => {
  const machine = createMachine(JSON.parse(lifecycle.machineDef));
  const graph = toDirectedGraph(machine);

  const width = 800;
  const height = 400;

  const boxWidth = 120;
  const boxHeight = 30;
  const cornerRound = 10;

  const initialState: string = machine.id + '.' + machine.initial?.toString();

  const nodes = graph.children.map(node => {
    // 2 is current state
    const group = lifecycle.state && node.id.endsWith(lifecycle.state) ? 2 : 1;
    if (node.id.endsWith(initialState)) {
      return {
        id: node.id,
        group: group,
        fx: boxWidth / 2 + 10,
      };
    }

    if (node.stateNode.type === 'final') {
      return {
        id: node.id,
        group: group,
        fx: width - boxWidth / 2 - 10,
      };
    }
    return {
      id: node.id,
      group: group,
    };
  });

  const links = graph.children.flatMap(node =>
    node.edges.map(edge => ({
      source: edge.source.id,
      target: edge.target.id,
    }))
  );
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3.forceLink(links).id(d => d.id)
    )
    .force('charge', d3.forceManyBody().strength(-100))
    .force('collide', d3.forceCollide().radius(80).iterations(2))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const svg = d3.select(ref);
  svg.select('*').remove();

  const defs = svg.append('svg:defs');
  defs
    .append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('markerWidth', 10.5)
    .attr('markerHeight', 10.5)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5');

  const filter = defs
    .append('filter')
    .attr('id', 'drop-shadow')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', '200%')
    .attr('height', '200%');

  filter
    .append('feDropShadow')
    .attr('dx', 2)
    .attr('dy', 2)
    .attr('stdDeviation', 1)
    .attr('flood-color', options.strokeDefaultColor)
    .attr('flood-opacity', 1);

  svg.attr('viewBox', [0, 0, width, height]);
  const link = svg
    .append('g')
    .attr('stroke', options.strokeDefaultColor)
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke-width', _ => 1)
    .style('marker-end', 'url(#end-arrow)');

  const node = svg
    .append('g')
    .attr('class', 'nodes')
    .attr('stroke-width', 1.5)
    .selectAll('rect')
    .data(nodes)
    .enter()
    .append('rect')
    .attr('stroke', d => (d.group === 1 ? options.strokeDefaultColor : options.strokePrimaryColor))
    .attr('width', boxWidth)
    .attr('height', boxHeight)
    .attr('rx', cornerRound)
    .attr('ry', cornerRound)
    .attr('fill', options.fillColor)
    .style('filter', 'url(#drop-shadow)');
  const text = svg
    .append('g')
    .attr('class', 'text')
    .attr('stroke-width', 1.5)
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('x', '50%')
    .attr('y', boxHeight)
    .attr('dx', boxWidth / 2)
    .attr('dy', boxHeight / 2)
    .attr('fill', d => (d.group === 1 ? options.strokeDefaultColor : options.strokePrimaryColor))
    .attr('font-weight', 400)
    .attr('font', options.font)
    .attr('font-size', options.fontSize)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .text(d => d.id.split('.').pop());
  node.append('title').text(d => d.id);

  simulation.on('tick', () => {
    link
      .attr('x1', d => {
        let change = 0;
        if (Math.abs(d.target.x - d.source.x) > boxWidth) {
          // Boxes are far apart, draw from corner
          const direction = Math.sign(d.target.x - d.source.x);
          change = (direction * (boxWidth - cornerRound / 2)) / 2;
        }
        return d.source.x + change;
      })
      .attr('y1', d => {
        let change = 0;
        if (Math.abs(d.target.y - d.source.y) > boxHeight) {
          // Boxes are far apart, draw from corner
          const direction = Math.sign(d.target.y - d.source.y);
          change = (direction * (boxHeight - cornerRound / 2)) / 2;
        }
        return d.source.y + change;
      })
      .attr('x2', d => {
        let change = 0;
        if (Math.abs(d.target.x - d.source.x) > boxWidth) {
          // Boxes are far apart, draw from corner
          const direction = -Math.sign(d.target.x - d.source.x);
          change = (direction * (boxWidth - cornerRound / 2)) / 2;
        }
        return d.target.x + change;
      })
      .attr('y2', d => {
        let change = 0;
        if (Math.abs(d.target.y - d.source.y) > boxHeight) {
          // Boxes are far apart, draw from corner
          const direction = -Math.sign(d.target.y - d.source.y);
          change = (direction * (boxHeight - cornerRound / 2)) / 2;
        }
        return d.target.y + change;
      });

    node.attr('x', d => d.x - boxWidth / 2).attr('y', d => d.y - boxHeight / 2);
    text.attr('x', d => d.x - boxWidth / 2).attr('y', d => d.y - boxHeight / 2);
  });
  simulation.tick(1000);
  //simulation.stop();
  setTimeout(() => {
    simulation.stop();
  }, 1);
};
export default LifecycleVisualizer;
