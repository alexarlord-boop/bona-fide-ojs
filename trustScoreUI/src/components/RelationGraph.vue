<template>
  <div class="graph-modal" v-if="isVisible" @click.self="closeModal">
    <div class="graph-content">
      <div class="graph-header">
        <h3>Collaboration Network for {{ centerNodeName }}</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      <div
          ref="graphContainer"
          class="graph-container"
      ></div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch, nextTick} from 'vue';
import * as d3 from 'd3';
import {useResearcherGraph} from "../composables/useResearcherGraph.js";

const {
  loadingData, fetchResearcherGraph
} = useResearcherGraph();


const props = defineProps({
  isVisible: Boolean,
  centerNodeName: String
});

const emit = defineEmits(['close']);

const graphContainer = ref(null);

function closeModal() {
  emit('close');
}

async function renderGraph() {
  if (!graphContainer.value) return;

  const container = graphContainer.value;
  container.innerHTML = "";

  const width = 800;
  const height = 600;

  const graphData = await fetchResearcherGraph(props.centerNodeName);

  console.log(JSON.stringify(graphData));

  const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

  const nodes = {};
  graphData.forEach(d => {
    nodes[d.source] = {id: d.source};
    nodes[d.target] = {id: d.target};
  });

  const simulation = d3.forceSimulation(Object.values(nodes))
      .force("link", d3.forceLink(graphData).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg.append("g")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1)
      .selectAll("line")
      .data(graphData)
      .join("line");

  const node = svg.append("g")
      .selectAll("circle")
      .data(simulation.nodes())
      .join("circle")
      .attr("r", 6)
      .attr("fill", d => d.id === props.centerNodeName ? "#ff0000" : "#0022ff")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .call(drag(simulation));

  const label = svg.append("g")
      .selectAll("text")
      .data(simulation.nodes())
      .join("text")
      .attr("font-size", "12px")
      .attr("fill", "#333")
      .style("pointer-events", "none")
      .text(d => d.id);

  simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    label
        .attr("x", d => d.x + 8)
        .attr("y", d => d.y + 4);
  });

  function drag(sim) {
    return d3.drag()
        .on("start", event => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", event => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", event => {
          if (!event.active) sim.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        });
  }
}

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      renderGraph();
    });
  }
});
</script>

<style scoped>
.graph-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.graph-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-width: 90vw;
  max-height: 90vh;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.graph-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #e9ecef;
  color: #333;
}

.graph-container {
  width: 800px;
  height: 600px;
  border: 1px solid #ddd;
  background: white;
  overflow: hidden;
}
</style>