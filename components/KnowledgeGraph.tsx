import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink } from '../types';
import { Search, Upload, Plus, Save, ZoomIn, ZoomOut, Maximize2, Download, FileUp, X, Activity, Zap, Thermometer, Gauge, TrendingUp } from 'lucide-react';
import { analyzeDocument } from '../services/geminiService';

interface KnowledgeGraphProps {
    isDarkMode: boolean;
}

const MOCK_NODES: GraphNode[] = [
  { id: 'Event-001', group: 'event', label: '液压故障', details: '压力不足导致停机', status: 'error' },
  { id: 'Event-002', group: 'event', label: '产量下降', details: '比计划低15%', status: 'warning' },
  { id: 'Eq-001', group: 'equipment', label: '3号采煤机', details: '型号 MG750', status: 'error' },
  { id: 'Person-001', group: 'personnel', label: '李强', details: '设备负责人' },
  { id: 'Person-002', group: 'personnel', label: '王五', details: '检修班长' },
  { id: 'Area-001', group: 'area', label: '1402工作面', details: '主产区' },
  { id: 'Doc-001', group: 'area', label: '检修规程 v2.0', details: '制度文件' },
];

const MOCK_LINKS: GraphLink[] = [
  { source: 'Event-001', target: 'Eq-001', type: '发生于' },
  { source: 'Event-001', target: 'Event-002', type: '导致' },
  { source: 'Person-001', target: 'Eq-001', type: '负责' },
  { source: 'Person-002', target: 'Event-001', type: '关联检修' },
  { source: 'Eq-001', target: 'Area-001', type: '位于' },
  { source: 'Doc-001', target: 'Person-002', type: '约束' },
];

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ isDarkMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const linkingLineRef = useRef<SVGLineElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>(MOCK_NODES);
  const [links, setLinks] = useState<GraphLink[]>(MOCK_LINKS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddRelationDialog, setShowAddRelationDialog] = useState(false);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [linkingSource, setLinkingSource] = useState<GraphNode | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [statusPanelNode, setStatusPanelNode] = useState<GraphNode | null>(null);
  const [equipmentData, setEquipmentData] = useState({
    power: 750,
    temperature: 68,
    speed: 1450,
    runtime: 8.5,
    voltage: 660,
    current: 85.2,
    vibration: 0.8,
    pressure: 15.5,
    oilTemp: 45,
    efficiency: 92.5,
    status: 'running' as 'running' | 'warning' | 'error',
    chartData: [80, 70, 85, 60, 75, 50, 65, 45, 55, 40, 50, 35, 45, 30, 40, 25, 30] as number[]
  });
  const [newNodeForm, setNewNodeForm] = useState({
    label: '',
    type: 'equipment',
    details: ''
  });
  const [editNodeForm, setEditNodeForm] = useState({
    id: '',
    label: '',
    type: 'equipment',
    details: ''
  });
  const [newRelationForm, setNewRelationForm] = useState({
    source: '',
    target: '',
    type: ''
  });

  // Simulate real-time equipment data updates
  useEffect(() => {
    if (!showStatusPanel) return;

    const interval = setInterval(() => {
      setEquipmentData(prev => {
        // Generate small random variations
        const powerVar = (Math.random() - 0.5) * 20;
        const tempVar = (Math.random() - 0.5) * 3;
        const speedVar = (Math.random() - 0.5) * 30;
        const currentVar = (Math.random() - 0.5) * 5;
        const vibrationVar = (Math.random() - 0.5) * 0.2;
        const pressureVar = (Math.random() - 0.5) * 1;

        const newPower = Math.max(700, Math.min(800, prev.power + powerVar));
        const newTemp = Math.max(60, Math.min(85, prev.temperature + tempVar));
        const newSpeed = Math.max(1400, Math.min(1500, prev.speed + speedVar));
        const newCurrent = Math.max(75, Math.min(95, prev.current + currentVar));
        const newVibration = Math.max(0.5, Math.min(1.5, prev.vibration + vibrationVar));
        const newPressure = Math.max(14, Math.min(17, prev.pressure + pressureVar));

        // Determine status based on thresholds
        let status: 'running' | 'warning' | 'error' = 'running';
        if (newTemp > 80 || newVibration > 1.2) {
          status = 'warning';
        }
        if (newTemp > 83 || newVibration > 1.4) {
          status = 'error';
        }

        // Update chart data (shift left and add new point)
        const newChartData = [...prev.chartData.slice(1), Math.random() * 60 + 20];

        return {
          ...prev,
          power: parseFloat(newPower.toFixed(1)),
          temperature: parseFloat(newTemp.toFixed(1)),
          speed: Math.round(newSpeed),
          current: parseFloat(newCurrent.toFixed(1)),
          vibration: parseFloat(newVibration.toFixed(2)),
          pressure: parseFloat(newPressure.toFixed(1)),
          runtime: parseFloat((prev.runtime + 0.0166).toFixed(2)), // Add ~1 minute
          efficiency: parseFloat((92 + Math.random() * 3).toFixed(1)),
          status,
          chartData: newChartData
        };
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [showStatusPanel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedNode) {
          handleDeleteNode();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        // Enter linking mode
        if (selectedNode && !isLinkingMode) {
          setIsLinkingMode(true);
          setLinkingSource(selectedNode);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // Exit linking mode
        setIsLinkingMode(false);
        setLinkingSource(null);
        setMousePosition(null);
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (selectedNode) {
          handleEditNode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, nodes, links, isLinkingMode]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    // Create a group for all graph elements (for zoom/pan)
    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])  // Allow zoom from 10% to 400%
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);
    zoomRef.current = zoom as any;

    // Mouse move handler for linking mode
    const handleMouseMove = (event: MouseEvent) => {
      if (isLinkingMode && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const transform = d3.zoomTransform(svg.node() as any);
        setMousePosition({
          x: (event.clientX - rect.left - transform.x) / transform.k,
          y: (event.clientY - rect.top - transform.y) / transform.k
        });
      }
    };

    svg.node()?.addEventListener('mousemove', handleMouseMove);

    // Simulation setup - adjust forces based on number of nodes
    const nodeCount = nodes.length;
    const linkDistance = Math.max(80, Math.min(150, 500 / Math.sqrt(nodeCount)));
    const chargeStrength = Math.max(-800, Math.min(-200, -2000 / Math.sqrt(nodeCount)));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(linkDistance))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    // Colors
    const linkColor = isDarkMode ? "#475569" : "#94a3b8";
    const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
    const subTextColor = isDarkMode ? "#94a3b8" : "#64748b";

    // Draw lines
    const link = g.append("g")
      .attr("stroke", linkColor)
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")
      .attr("cursor", "pointer")
      .on("dblclick", (event, d: any) => {
        event.stopPropagation();
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        const newType = prompt('修改关系类型:', d.type);
        if (newType && newType.trim()) {
          setLinks(prev => prev.map(link => {
            const linkSourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
            const linkTargetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
            if (linkSourceId === sourceId && linkTargetId === targetId) {
              return { ...link, type: newType.trim() };
            }
            return link;
          }));
        }
      });

    // Arrowhead marker
    g.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25) // Distance from node center
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", linkColor);

    // Link labels
    const linkText = g.append("g")
        .selectAll("text")
        .data(links)
        .join("text")
        .text((d) => d.type)
        .attr("font-size", 10)
        .attr("fill", subTextColor)
        .attr("text-anchor", "middle")
        .attr("dy", -5);

    // Draw nodes
    const node = g.append("g")
      .attr("stroke", isDarkMode ? "#1e293b" : "#fff")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 20)
      .attr("fill", (d) => {
        if (d.group === 'equipment') return '#3b82f6'; // Blue
        if (d.group === 'event') return d.status === 'error' ? '#ef4444' : '#f59e0b'; // Red/Orange
        if (d.group === 'personnel') return '#10b981'; // Green
        return '#8b5cf6'; // Purple
      })
      .attr("stroke", (d) => {
        if (selectedNode?.id === d.id) return '#3b82f6'; // Blue for selected
        return isDarkMode ? "#1e293b" : "#fff";
      })
      .attr("stroke-width", (d) => selectedNode?.id === d.id ? 4 : 1.5)
      .attr("opacity", (d) => isLinkingMode && linkingSource?.id === d.id ? 0.5 : 1)
      .call(drag(simulation) as any)
      .on("click", (event, d) => {
        event.stopPropagation();

        if (isLinkingMode && linkingSource && linkingSource.id !== d.id) {
          // Complete the link
          const relationType = prompt('输入关系类型:', '关联');
          if (relationType && relationType.trim()) {
            const newLink: GraphLink = {
              source: linkingSource.id,
              target: d.id,
              type: relationType.trim()
            };
            setLinks(prev => [...prev, newLink]);
          }
          // Exit linking mode
          setIsLinkingMode(false);
          setLinkingSource(null);
          setMousePosition(null);
        } else {
          setSelectedNode(d);
          // Show status panel for equipment nodes
          if (d.group === 'equipment') {
            setStatusPanelNode(d);
            setShowStatusPanel(true);
          }
        }
      })
      .on("dblclick", (event, d) => {
        event.stopPropagation();
        if (!isLinkingMode) {
          setEditNodeForm({
            id: d.id,
            label: d.label,
            type: d.group,
            details: d.details || ''
          });
          setShowEditDialog(true);
        }
      });

    // Node Labels
    const label = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.label)
      .attr("font-size", 12)
      .attr("dx", 25)
      .attr("dy", 4)
      .attr("fill", textColor)
      .style("pointer-events", "none")
      .style("font-weight", "bold");

    // Ticker
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      
      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);

      linkText
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);
    });

    // Background click deselect
    svg.on("click", () => {
      setSelectedNode(null);
    });

    // Create temporary linking line element
    const linkingLine = g.append("line")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0)
      .attr("pointer-events", "none");
    linkingLineRef.current = linkingLine.node();

    // Cleanup
    return () => {
      simulation.stop();
      linkingLineRef.current = null;
    };
  }, [nodes, links, isDarkMode, selectedNode, isLinkingMode, linkingSource]);

  // Update temporary linking line without re-rendering entire graph
  useEffect(() => {
    if (!linkingLineRef.current) return;

    const line = d3.select(linkingLineRef.current);

    if (isLinkingMode && linkingSource && mousePosition) {
      const sourceNode = nodes.find(n => n.id === linkingSource.id);
      if (sourceNode && (sourceNode as any).x && (sourceNode as any).y) {
        line
          .attr("x1", (sourceNode as any).x)
          .attr("y1", (sourceNode as any).y)
          .attr("x2", mousePosition.x)
          .attr("y2", mousePosition.y)
          .attr("opacity", 0.6);
      }
    } else {
      line.attr("opacity", 0);
    }
  }, [isLinkingMode, linkingSource, mousePosition, nodes]);

  // Drag behavior
  const drag = (simulation: d3.Simulation<GraphNode, undefined>) => {
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      // 保持节点的固定位置,防止拖拽后复位
      // 不设置 fx 和 fy 为 null,节点会保持在拖拽后的位置
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  // Zoom control functions
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy as any, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy as any, 0.7);
  };

  const handleZoomReset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.transform as any, d3.zoomIdentity);
  };

  // Manual add node
  const handleManualAdd = () => {
    setShowAddDialog(true);
  };

  const handleAddNode = () => {
    if (!newNodeForm.label.trim()) {
      alert('请输入节点名称');
      return;
    }

    const newNode: GraphNode = {
      id: `Manual-${Date.now()}`,
      group: newNodeForm.type as any,
      label: newNodeForm.label,
      details: newNodeForm.details || '手动添加'
    };

    setNodes(prev => [...prev, newNode]);
    setShowAddDialog(false);
    setNewNodeForm({ label: '', type: 'equipment', details: '' });
    alert(`成功添加节点: ${newNodeForm.label}`);
  };

  // Edit node
  const handleEditNode = () => {
    if (!selectedNode) return;

    setEditNodeForm({
      id: selectedNode.id,
      label: selectedNode.label,
      type: selectedNode.group,
      details: selectedNode.details || ''
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editNodeForm.label.trim()) {
      alert('请输入节点名称');
      return;
    }

    setNodes(prev => prev.map(node =>
      node.id === editNodeForm.id
        ? { ...node, label: editNodeForm.label, group: editNodeForm.type as any, details: editNodeForm.details }
        : node
    ));

    setShowEditDialog(false);
    setSelectedNode(null);
    alert(`节点已更新: ${editNodeForm.label}`);
  };

  // Delete node
  const handleDeleteNode = () => {
    if (!selectedNode) return;

    if (!confirm(`确定要删除节点 "${selectedNode.label}" 吗？\n\n这将同时删除与该节点相关的所有关系。`)) {
      return;
    }

    // Remove node
    setNodes(prev => prev.filter(node => node.id !== selectedNode.id));

    // Remove related links
    setLinks(prev => prev.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      return sourceId !== selectedNode.id && targetId !== selectedNode.id;
    }));

    setSelectedNode(null);
    alert(`已删除节点: ${selectedNode.label}`);
  };

  // Add relation
  const handleAddRelation = () => {
    if (!selectedNode) return;

    setNewRelationForm({
      source: selectedNode.id,
      target: '',
      type: '关联'
    });
    setShowAddRelationDialog(true);
  };

  const handleSaveRelation = () => {
    if (!newRelationForm.source || !newRelationForm.target) {
      alert('请选择源节点和目标节点');
      return;
    }

    if (newRelationForm.source === newRelationForm.target) {
      alert('不能创建指向自身的关系');
      return;
    }

    if (!newRelationForm.type.trim()) {
      alert('请输入关系类型');
      return;
    }

    const newLink: GraphLink = {
      source: newRelationForm.source,
      target: newRelationForm.target,
      type: newRelationForm.type
    };

    setLinks(prev => [...prev, newLink]);
    setShowAddRelationDialog(false);
    setNewRelationForm({ source: '', target: '', type: '' });
    alert(`已添加关系: ${newRelationForm.type}`);
  };

  // Save model
  const handleSaveModel = () => {
    // Convert links to simple format (ID strings instead of object references)
    const linksToSave = links.map(link => ({
      source: typeof link.source === 'object' ? (link.source as any).id : link.source,
      target: typeof link.target === 'object' ? (link.target as any).id : link.target,
      type: link.type
    }));

    const model = {
      nodes: nodes,
      links: linksToSave,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('knowledgeGraph', JSON.stringify(model));

    // Also download as JSON file
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `知识图谱_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`✅ 模型已保存！\n- 已保存到浏览器缓存\n- 已下载 JSON 文件\n\n节点数: ${nodes.length}\n关系数: ${links.length}`);
  };

  // Load model from JSON file
  const handleLoadModel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const model = JSON.parse(text);

      if (!model.nodes || !model.links) {
        alert('无效的文件格式！请选择正确的知识图谱 JSON 文件。');
        return;
      }

      // Restore nodes and links
      setNodes(model.nodes);
      setLinks(model.links);

      alert(`✅ 模型加载成功！\n\n节点数: ${model.nodes.length}\n关系数: ${model.links.length}`);
    } catch (error) {
      console.error('Load model error:', error);
      alert(`加载失败: ${(error as Error).message}`);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);

      try {
        console.log("开始处理文件:", file.name, "类型:", file.type);

        // Call Gemini to extract entities and relations
        // Pass the file directly for Excel/PDF support, or text for text files
        let result;
        if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
            // For text files, read as text first
            console.log("作为文本文件处理");
            const text = await file.text();
            result = await analyzeDocument(text);
        } else {
            // For Excel, PDF, and other binary files, pass the File object directly
            console.log("作为二进制文件处理 (Excel/PDF)");
            result = await analyzeDocument(file);
        }

        console.log("Extracted Data:", result);

        const extractedEntities = result.entities || [];
        const extractedRelations = result.relations || [];

        if (extractedEntities.length === 0 && extractedRelations.length === 0) {
            alert("未能从文档中提取到实体和关系。\n\n请检查：\n1. 浏览器控制台是否有错误信息\n2. 文档是否包含可识别的内容\n3. API Key 是否有效\n\n请按 F12 打开控制台查看详细日志。");
            return;
        }

        // Convert extracted entities to GraphNodes
        const newNodes: GraphNode[] = extractedEntities.map((entity: any, index: number) => {
            // Determine group based on entity type
            let group: string = 'area'; // default
            const entityType = entity.type?.toLowerCase() || '';

            if (entityType.includes('设备') || entityType.includes('equipment')) {
                group = 'equipment';
            } else if (entityType.includes('人员') || entityType.includes('personnel') || entityType.includes('人')) {
                group = 'personnel';
            } else if (entityType.includes('事件') || entityType.includes('event') || entityType.includes('故障')) {
                group = 'event';
            }

            return {
                id: `Auto-${Date.now()}-${index}`,
                group: group,
                label: entity.name,
                details: `类型: ${entity.type} (来源: ${file.name})`
            };
        });

        // Build a map of entity names to node IDs for relation mapping
        const entityNameToId = new Map<string, string>();
        newNodes.forEach(node => {
            // Extract entity name from label
            entityNameToId.set(node.label, node.id);
        });

        // Also include existing nodes in the map for potential cross-references
        nodes.forEach(node => {
            entityNameToId.set(node.label, node.id);
        });

        // Convert extracted relations to GraphLinks
        const newLinks: GraphLink[] = extractedRelations
            .map((relation: any) => {
                const sourceId = entityNameToId.get(relation.source);
                const targetId = entityNameToId.get(relation.target);

                // Only create link if both source and target exist
                if (sourceId && targetId) {
                    return {
                        source: sourceId,
                        target: targetId,
                        type: relation.type || '关联'
                    };
                }
                return null;
            })
            .filter((link): link is GraphLink => link !== null);

        // Update nodes and links
        setNodes(prev => [...prev, ...newNodes]);
        setLinks(prev => [...prev, ...newLinks]);

        alert(`✅ 成功提取 ${newNodes.length} 个实体和 ${newLinks.length} 条关系！`);

      } catch (err) {
          console.error("Document analysis error:", err);
          alert(`处理失败: ${(err as Error).message}`);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <>
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Left Panel: Controls */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 shadow-sm z-10 transition-colors duration-200">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">图谱配置</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">搜索实体</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="输入名称..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">模型构建</label>
             <div className="border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="doc-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".txt,.json,.md,.pdf,.xlsx,.xls,.doc,.docx"
                />
                <label htmlFor="doc-upload" className={`cursor-pointer flex flex-col items-center ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="w-8 h-8 text-blue-500 dark:text-blue-400 mb-2" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">上传文档自动建模</span>
                    <span className="text-xs text-blue-400 dark:text-blue-500 mt-1">支持 Excel, PDF, Word, TXT (由 Gemini AI 解析)</span>
                </label>
                {isProcessing && <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 animate-pulse">正在使用 AI 解析文档...</div>}
             </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="space-y-2">
               <div className="flex space-x-2">
                   <button
                     onClick={handleManualAdd}
                     className="flex-1 flex items-center justify-center px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                   >
                       <Plus className="w-4 h-4 mr-1" /> 手动添加
                   </button>
                   <input
                     type="file"
                     id="model-upload"
                     className="hidden"
                     onChange={handleLoadModel}
                     accept=".json"
                   />
                   <label
                     htmlFor="model-upload"
                     className="flex-1 flex items-center justify-center px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                   >
                       <FileUp className="w-4 h-4 mr-1" /> 导入模型
                   </label>
               </div>
               <button
                 onClick={handleSaveModel}
                 className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow-md transition-colors"
               >
                   <Download className="w-4 h-4 mr-1" /> 导出模型
               </button>
             </div>
             <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
               当前: {nodes.length} 个节点, {links.length} 条关系
             </div>
          </div>
        </div>

        {selectedNode && !isLinkingMode && (
            <div className="mt-auto bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">{selectedNode.label}</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{selectedNode.group}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300 mb-3">{selectedNode.details}</div>
                {selectedNode.status && (
                    <div className={`mb-3 inline-block px-2 py-0.5 text-xs rounded ${
                        selectedNode.status === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        selectedNode.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                        {selectedNode.status === 'error' ? '故障' : selectedNode.status === 'warning' ? '预警' : '正常'}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Right Panel: Visualization */}
      <div className="flex-1 relative" ref={containerRef}>
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
            title="放大"
          >
            <ZoomIn className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <button
            onClick={handleZoomReset}
            className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
            title="重置视图"
          >
            <Maximize2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>

        {/* Legend and Shortcuts */}
        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-3 rounded-lg shadow border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-1">
             <div className="font-medium text-slate-700 dark:text-slate-300 mb-2">图例</div>
             <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>设备</div>
             <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>人员</div>
             <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>故障事件</div>
             <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>区域/文档</div>

             <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
               💡 滚轮缩放 · 拖拽平移
             </div>

             <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
               <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">快捷键</div>
               <div className="flex items-center justify-between gap-2">
                 <span className="text-[10px]">双击节点</span>
                 <span className="text-blue-600 dark:text-blue-400 text-[10px]">编辑</span>
               </div>
               <div className="flex items-center justify-between gap-2">
                 <span className="text-[10px]">双击连线</span>
                 <span className="text-blue-600 dark:text-blue-400 text-[10px]">修改</span>
               </div>
               <div className="flex items-center justify-between gap-2">
                 <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">空格</kbd>
                 <span className="text-green-600 dark:text-green-400 text-[10px]">连线模式</span>
               </div>
               <div className="flex items-center justify-between gap-2">
                 <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">Esc</kbd>
                 <span className="text-gray-600 dark:text-gray-400 text-[10px]">取消连线</span>
               </div>
               <div className="flex items-center justify-between gap-2">
                 <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">Del</kbd>
                 <span className="text-red-600 dark:text-red-400 text-[10px]">删除节点</span>
               </div>
             </div>
        </div>

        {/* Status Indicators */}
        {isLinkingMode && linkingSource && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
            <span>连线模式</span>
            <span className="text-xs opacity-80">源节点: {linkingSource.label}</span>
            <span className="text-xs opacity-60">按 Esc 取消</span>
          </div>
        )}
        {!isLinkingMode && selectedNode && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            已选中: {selectedNode.label}
          </div>
        )}
      </div>
    </div>

    {/* Add Node Dialog */}
    {showAddDialog && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">手动添加节点</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                节点名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newNodeForm.label}
                onChange={(e) => setNewNodeForm({ ...newNodeForm, label: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-200"
                placeholder="例如: 4号采煤机"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                节点类型
              </label>
              <select
                value={newNodeForm.type}
                onChange={(e) => setNewNodeForm({ ...newNodeForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-200"
              >
                <option value="equipment">设备</option>
                <option value="personnel">人员</option>
                <option value="event">事件</option>
                <option value="area">区域/文档</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                详细信息
              </label>
              <textarea
                value={newNodeForm.details}
                onChange={(e) => setNewNodeForm({ ...newNodeForm, details: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-200"
                placeholder="例如: 型号 MG750, 额定功率 750kW"
                rows={3}
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowAddDialog(false)}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddNode}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Node Dialog */}
    {showEditDialog && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">编辑节点</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                节点名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editNodeForm.label}
                onChange={(e) => setEditNodeForm({ ...editNodeForm, label: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                节点类型
              </label>
              <select
                value={editNodeForm.type}
                onChange={(e) => setEditNodeForm({ ...editNodeForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-200"
              >
                <option value="equipment">设备</option>
                <option value="personnel">人员</option>
                <option value="event">事件</option>
                <option value="area">区域/文档</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                详细信息
              </label>
              <textarea
                value={editNodeForm.details}
                onChange={(e) => setEditNodeForm({ ...editNodeForm, details: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-200"
                rows={3}
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowEditDialog(false)}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Add Relation Dialog */}
    {showAddRelationDialog && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">添加关系</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                源节点
              </label>
              <input
                type="text"
                value={nodes.find(n => n.id === newRelationForm.source)?.label || ''}
                disabled
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                目标节点 <span className="text-red-500">*</span>
              </label>
              <select
                value={newRelationForm.target}
                onChange={(e) => setNewRelationForm({ ...newRelationForm, target: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-200"
              >
                <option value="">请选择目标节点</option>
                {nodes.filter(n => n.id !== newRelationForm.source).map(node => (
                  <option key={node.id} value={node.id}>{node.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                关系类型 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newRelationForm.type}
                onChange={(e) => setNewRelationForm({ ...newRelationForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-200"
                placeholder="例如: 负责、位于、导致"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowAddRelationDialog(false)}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveRelation}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Equipment Status Panel */}
    {showStatusPanel && statusPanelNode && statusPanelNode.group === 'equipment' && (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
        onClick={() => setShowStatusPanel(false)}
      >
        <div
          className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-blue-500/50 rounded-lg shadow-2xl w-[800px] max-w-[90vw] max-h-[80vh] overflow-hidden animate-slideIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r px-6 py-4 flex items-center justify-between ${
            equipmentData.status === 'error' ? 'from-red-600 to-red-700' :
            equipmentData.status === 'warning' ? 'from-orange-600 to-orange-700' :
            'from-blue-600 to-blue-700'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${
                equipmentData.status === 'error' ? 'bg-red-300 shadow-red-500/50' :
                equipmentData.status === 'warning' ? 'bg-yellow-300 shadow-yellow-500/50' :
                'bg-green-400 shadow-green-500/50'
              }`}></div>
              <h3 className="text-xl font-bold text-white">{statusPanelNode.label}</h3>
              <span className={`px-3 py-1 text-white text-xs rounded-full font-medium ${
                equipmentData.status === 'error' ? 'bg-red-500' :
                equipmentData.status === 'warning' ? 'bg-orange-500' :
                'bg-green-500'
              }`}>
                {equipmentData.status === 'error' ? '故障' : equipmentData.status === 'warning' ? '预警' : '运行中'}
              </span>
            </div>
            <button
              onClick={() => setShowStatusPanel(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-80px)]">
            {/* Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Power */}
              <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-4 hover:border-blue-500/60 transition-all animate-slideUp">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-xs text-slate-400">功率</span>
                </div>
                <div className="text-2xl font-bold text-white">{equipmentData.power}<span className="text-sm text-slate-400 ml-1">kW</span></div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+{((equipmentData.power - 750) / 750 * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Temperature */}
              <div className={`bg-slate-800/50 border rounded-lg p-4 transition-all animate-slideUp ${
                equipmentData.temperature > 80 ? 'border-red-500/50 hover:border-red-500/80' :
                'border-orange-500/30 hover:border-orange-500/60'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className={`w-5 h-5 ${equipmentData.temperature > 80 ? 'text-red-400' : 'text-orange-400'}`} />
                  <span className="text-xs text-slate-400">温度</span>
                </div>
                <div className={`text-2xl font-bold ${equipmentData.temperature > 80 ? 'text-red-400' : 'text-white'}`}>
                  {equipmentData.temperature}<span className="text-sm text-slate-400 ml-1">°C</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full transition-all ${
                    equipmentData.temperature > 80 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                    'bg-gradient-to-r from-green-500 to-orange-500'
                  }`} style={{width: `${Math.min((equipmentData.temperature / 100) * 100, 100)}%`}}></div>
                </div>
              </div>

              {/* Speed */}
              <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4 hover:border-purple-500/60 transition-all animate-slideUp">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-slate-400">转速</span>
                </div>
                <div className="text-2xl font-bold text-white">{equipmentData.speed}<span className="text-sm text-slate-400 ml-1">rpm</span></div>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
                  <span className="text-xs text-purple-400">正常</span>
                </div>
              </div>

              {/* Runtime */}
              <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-500/60 transition-all animate-slideUp">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs text-slate-400">运行时长</span>
                </div>
                <div className="text-2xl font-bold text-white">{equipmentData.runtime}<span className="text-sm text-slate-400 ml-1">h</span></div>
                <div className="text-xs text-slate-500 mt-1">今日累计</div>
              </div>
            </div>

            {/* Real-time Chart Simulation */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-white">实时监控</div>
                <div className="text-xs text-slate-400">功率波动曲线</div>
              </div>
              <div className="h-32 bg-slate-900/50 rounded relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 800 120" preserveAspectRatio="none">
                  <polyline
                    points={equipmentData.chartData.map((y, i) => `${i * (800 / equipmentData.chartData.length)},${120 - y}`).join(' ')}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    className="chart-line-animate"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="800" y2="30" stroke="#475569" strokeWidth="0.5" opacity="0.3" />
                  <line x1="0" y1="60" x2="800" y2="60" stroke="#475569" strokeWidth="0.5" opacity="0.3" />
                  <line x1="0" y1="90" x2="800" y2="90" stroke="#475569" strokeWidth="0.5" opacity="0.3" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
                <div className="absolute top-2 right-2 text-xs text-green-400 font-mono">
                  {equipmentData.power} kW
                </div>
              </div>
            </div>

            {/* Parameters List */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="text-sm font-medium text-white mb-3">运行参数</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">电压</span>
                  <span className="text-white font-medium">{equipmentData.voltage} V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">电流</span>
                  <span className="text-white font-medium">{equipmentData.current} A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">振动</span>
                  <span className={`font-medium ${
                    equipmentData.vibration > 1.2 ? 'text-red-400' :
                    equipmentData.vibration > 1.0 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>{equipmentData.vibration} mm/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">压力</span>
                  <span className="text-white font-medium">{equipmentData.pressure} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">油温</span>
                  <span className="text-white font-medium">{equipmentData.oilTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">效率</span>
                  <span className="text-green-400 font-medium">{equipmentData.efficiency}%</span>
                </div>
              </div>
            </div>

            {/* Equipment Info */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="text-sm font-medium text-white mb-3">设备信息</div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>设备ID: {statusPanelNode.id}</div>
                <div>型号: MG750/1830-WD</div>
                <div>生产日期: 2022-03-15</div>
                <div>维护周期: 500小时</div>
                <div className="text-green-400">下次维护: 剩余 128 小时</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default KnowledgeGraph;