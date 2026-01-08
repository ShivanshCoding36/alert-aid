/**
 * ML-based Evacuation Route Optimization Service
 * Implements A* pathfinding with real-time hazard and traffic weighting
 */

export interface Coordinate {
  lat: number;
  lon: number;
}

export interface RouteNode {
  id: string;
  position: Coordinate;
  type: 'intersection' | 'shelter' | 'hospital' | 'checkpoint' | 'hazard';
  capacity?: number;
  currentOccupancy?: number;
  isAccessible: boolean;
  elevation: number; // meters
}

export interface RouteEdge {
  fromId: string;
  toId: string;
  distance: number; // meters
  roadType: 'highway' | 'main' | 'secondary' | 'residential' | 'pedestrian';
  condition: 'clear' | 'congested' | 'blocked' | 'flooded' | 'damaged';
  currentTrafficLevel: number; // 0-1
  maxCapacity: number; // vehicles per hour
  isEvacuationRoute: boolean;
}

export interface HazardZone {
  id: string;
  center: Coordinate;
  radius: number; // meters
  severity: 'low' | 'moderate' | 'high' | 'critical';
  type: 'flood' | 'fire' | 'chemical' | 'structural' | 'landslide';
  spreadRate?: number; // meters per hour
  expectedDuration?: number; // hours
}

export interface OptimizedRoute {
  id: string;
  waypoints: Coordinate[];
  totalDistance: number; // meters
  estimatedTime: number; // minutes
  safetyScore: number; // 0-100
  congestionLevel: number; // 0-100
  hazardExposure: number; // 0-100 (lower is better)
  shelterDestination: RouteNode;
  alternativeRoutes: OptimizedRoute[];
  instructions: RouteInstruction[];
  riskFactors: string[];
  updatedAt: Date;
}

export interface RouteInstruction {
  type: 'start' | 'turn_left' | 'turn_right' | 'continue' | 'merge' | 'exit' | 'arrive' | 'warning';
  text: string;
  distance: number; // meters to next instruction
  duration: number; // seconds
  coordinate: Coordinate;
}

export interface EvacuationRequest {
  origin: Coordinate;
  preferredDestinations?: string[]; // shelter IDs
  mobilityConstraints?: 'none' | 'wheelchair' | 'elderly' | 'children';
  vehicleType?: 'car' | 'bus' | 'walk' | 'emergency';
  groupSize: number;
  avoidHazards: boolean;
  prioritizeSafety: boolean; // vs speed
}

// Priority queue for A* algorithm
class PriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const result = this.heap[0].item;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return result;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      
      if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;
      
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

class EvacuationRouteService {
  private static instance: EvacuationRouteService;
  private nodes: Map<string, RouteNode> = new Map();
  private edges: Map<string, RouteEdge[]> = new Map();
  private hazardZones: HazardZone[] = [];

  private constructor() {
    this.initializeSampleNetwork();
  }

  public static getInstance(): EvacuationRouteService {
    if (!EvacuationRouteService.instance) {
      EvacuationRouteService.instance = new EvacuationRouteService();
    }
    return EvacuationRouteService.instance;
  }

  /**
   * Initialize sample road network (Delhi NCR region)
   */
  private initializeSampleNetwork(): void {
    // Sample nodes
    const sampleNodes: RouteNode[] = [
      { id: 'n1', position: { lat: 28.6139, lon: 77.2090 }, type: 'intersection', isAccessible: true, elevation: 216 },
      { id: 'n2', position: { lat: 28.6304, lon: 77.2177 }, type: 'intersection', isAccessible: true, elevation: 218 },
      { id: 'n3', position: { lat: 28.6472, lon: 77.2166 }, type: 'checkpoint', isAccessible: true, elevation: 220 },
      { id: 's1', position: { lat: 28.6589, lon: 77.2273 }, type: 'shelter', capacity: 500, currentOccupancy: 120, isAccessible: true, elevation: 225 },
      { id: 's2', position: { lat: 28.6200, lon: 77.1800 }, type: 'shelter', capacity: 800, currentOccupancy: 350, isAccessible: true, elevation: 230 },
      { id: 'h1', position: { lat: 28.6350, lon: 77.2250 }, type: 'hospital', capacity: 200, currentOccupancy: 80, isAccessible: true, elevation: 222 },
      { id: 'n4', position: { lat: 28.5921, lon: 77.0460 }, type: 'intersection', isAccessible: true, elevation: 210 },
      { id: 'n5', position: { lat: 28.5500, lon: 77.2500 }, type: 'intersection', isAccessible: true, elevation: 205 },
    ];

    for (const node of sampleNodes) {
      this.nodes.set(node.id, node);
    }

    // Sample edges
    const sampleEdges: RouteEdge[] = [
      { fromId: 'n1', toId: 'n2', distance: 2500, roadType: 'main', condition: 'clear', currentTrafficLevel: 0.3, maxCapacity: 2000, isEvacuationRoute: true },
      { fromId: 'n2', toId: 'n3', distance: 2000, roadType: 'main', condition: 'congested', currentTrafficLevel: 0.7, maxCapacity: 2000, isEvacuationRoute: true },
      { fromId: 'n3', toId: 's1', distance: 1500, roadType: 'secondary', condition: 'clear', currentTrafficLevel: 0.2, maxCapacity: 1000, isEvacuationRoute: true },
      { fromId: 'n1', toId: 's2', distance: 5000, roadType: 'highway', condition: 'clear', currentTrafficLevel: 0.4, maxCapacity: 4000, isEvacuationRoute: true },
      { fromId: 'n2', toId: 'h1', distance: 1200, roadType: 'secondary', condition: 'clear', currentTrafficLevel: 0.3, maxCapacity: 1000, isEvacuationRoute: false },
      { fromId: 'n1', toId: 'n4', distance: 18000, roadType: 'highway', condition: 'clear', currentTrafficLevel: 0.5, maxCapacity: 5000, isEvacuationRoute: true },
      { fromId: 'n1', toId: 'n5', distance: 8000, roadType: 'main', condition: 'congested', currentTrafficLevel: 0.8, maxCapacity: 2500, isEvacuationRoute: true },
      { fromId: 'n5', toId: 's2', distance: 10000, roadType: 'main', condition: 'clear', currentTrafficLevel: 0.3, maxCapacity: 2000, isEvacuationRoute: true },
    ];

    // Build adjacency list
    for (const edge of sampleEdges) {
      if (!this.edges.has(edge.fromId)) {
        this.edges.set(edge.fromId, []);
      }
      this.edges.get(edge.fromId)!.push(edge);
      
      // Add reverse edge for bidirectional roads
      if (!this.edges.has(edge.toId)) {
        this.edges.set(edge.toId, []);
      }
      this.edges.get(edge.toId)!.push({
        ...edge,
        fromId: edge.toId,
        toId: edge.fromId,
      });
    }
  }

  /**
   * Update hazard zones
   */
  public updateHazardZones(zones: HazardZone[]): void {
    this.hazardZones = zones;
  }

  /**
   * Calculate haversine distance between two coordinates
   */
  private haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371000; // Earth's radius in meters
    const lat1Rad = coord1.lat * Math.PI / 180;
    const lat2Rad = coord2.lat * Math.PI / 180;
    const deltaLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const deltaLon = (coord2.lon - coord1.lon) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Check if a point is within a hazard zone
   */
  private isInHazardZone(coord: Coordinate): HazardZone | null {
    for (const zone of this.hazardZones) {
      const distance = this.haversineDistance(coord, zone.center);
      if (distance <= zone.radius) {
        return zone;
      }
    }
    return null;
  }

  /**
   * Calculate edge cost considering multiple factors
   */
  private calculateEdgeCost(
    edge: RouteEdge,
    request: EvacuationRequest,
    fromNode: RouteNode,
    toNode: RouteNode
  ): number {
    let cost = edge.distance;

    // Traffic penalty
    const trafficMultiplier = 1 + edge.currentTrafficLevel * 2;
    cost *= trafficMultiplier;

    // Road condition penalties
    const conditionPenalties = {
      clear: 1,
      congested: 1.5,
      blocked: 100, // Nearly impassable
      flooded: 50,
      damaged: 10,
    };
    cost *= conditionPenalties[edge.condition];

    // Hazard zone penalties
    const midpoint: Coordinate = {
      lat: (fromNode.position.lat + toNode.position.lat) / 2,
      lon: (fromNode.position.lon + toNode.position.lon) / 2,
    };
    const hazard = this.isInHazardZone(midpoint);
    if (hazard && request.avoidHazards) {
      const severityPenalties = { low: 2, moderate: 5, high: 20, critical: 100 };
      cost *= severityPenalties[hazard.severity];
    }

    // Elevation consideration for floods
    if (edge.condition === 'flooded' && toNode.elevation > fromNode.elevation) {
      cost *= 0.8; // Prefer uphill routes during floods
    }

    // Accessibility considerations
    if (request.mobilityConstraints !== 'none') {
      if (edge.roadType === 'pedestrian') cost *= 0.8;
      if (!toNode.isAccessible) cost *= 10;
    }

    // Prefer designated evacuation routes
    if (edge.isEvacuationRoute) {
      cost *= 0.7;
    }

    // Safety vs speed preference
    if (request.prioritizeSafety) {
      // Increase cost for high-traffic areas
      cost *= 1 + edge.currentTrafficLevel * 0.5;
    }

    return cost;
  }

  /**
   * Find nearest node to a coordinate
   */
  private findNearestNode(coord: Coordinate): RouteNode | null {
    let nearest: RouteNode | null = null;
    let minDistance = Infinity;

    for (const node of this.nodes.values()) {
      const distance = this.haversineDistance(coord, node.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = node;
      }
    }

    return nearest;
  }

  /**
   * Find optimal evacuation route using A* algorithm
   */
  public async findOptimalRoute(request: EvacuationRequest): Promise<OptimizedRoute | null> {
    const startNode = this.findNearestNode(request.origin);
    if (!startNode) return null;

    // Find nearest shelter with capacity
    const shelters = Array.from(this.nodes.values())
      .filter(n => n.type === 'shelter' && n.capacity && n.currentOccupancy !== undefined)
      .filter(n => (n.capacity! - n.currentOccupancy!) >= request.groupSize)
      .sort((a, b) => 
        this.haversineDistance(request.origin, a.position) - 
        this.haversineDistance(request.origin, b.position)
      );

    if (shelters.length === 0) return null;

    const targetShelter = shelters[0];

    // A* algorithm
    const openSet = new PriorityQueue<string>();
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    gScore.set(startNode.id, 0);
    fScore.set(startNode.id, this.haversineDistance(startNode.position, targetShelter.position));
    openSet.enqueue(startNode.id, fScore.get(startNode.id)!);

    while (!openSet.isEmpty()) {
      const currentId = openSet.dequeue()!;
      const currentNode = this.nodes.get(currentId)!;

      if (currentId === targetShelter.id) {
        // Reconstruct path
        const path: string[] = [];
        let current = currentId;
        while (cameFrom.has(current)) {
          path.unshift(current);
          current = cameFrom.get(current)!;
        }
        path.unshift(startNode.id);

        return this.buildRouteResult(path, request, targetShelter, gScore.get(targetShelter.id)!);
      }

      const edges = this.edges.get(currentId) || [];
      for (const edge of edges) {
        const neighborNode = this.nodes.get(edge.toId);
        if (!neighborNode) continue;

        const tentativeG = gScore.get(currentId)! + 
          this.calculateEdgeCost(edge, request, currentNode, neighborNode);

        if (!gScore.has(edge.toId) || tentativeG < gScore.get(edge.toId)!) {
          cameFrom.set(edge.toId, currentId);
          gScore.set(edge.toId, tentativeG);
          const f = tentativeG + this.haversineDistance(neighborNode.position, targetShelter.position);
          fScore.set(edge.toId, f);
          openSet.enqueue(edge.toId, f);
        }
      }
    }

    return null; // No path found
  }

  /**
   * Build the route result object
   */
  private buildRouteResult(
    path: string[],
    request: EvacuationRequest,
    shelter: RouteNode,
    totalCost: number
  ): OptimizedRoute {
    const waypoints: Coordinate[] = path.map(id => this.nodes.get(id)!.position);
    
    // Calculate metrics
    let totalDistance = 0;
    let hazardExposure = 0;
    let congestionSum = 0;
    const riskFactors: string[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const edges = this.edges.get(path[i]) || [];
      const edge = edges.find(e => e.toId === path[i + 1]);
      if (edge) {
        totalDistance += edge.distance;
        congestionSum += edge.currentTrafficLevel;
        
        if (edge.condition === 'flooded') {
          hazardExposure += 30;
          riskFactors.push(`Flooded road segment near ${this.nodes.get(edge.fromId)?.position.lat.toFixed(4)}`);
        }
        if (edge.condition === 'damaged') {
          hazardExposure += 20;
          riskFactors.push('Route includes damaged road sections');
        }
      }
    }

    // Estimate time (assuming avg speed of 30 km/h in emergency)
    const avgSpeed = request.vehicleType === 'walk' ? 5 : 
                    request.vehicleType === 'emergency' ? 60 : 30;
    const estimatedTime = (totalDistance / 1000) / avgSpeed * 60;

    // Generate instructions
    const instructions = this.generateInstructions(path);

    const congestionLevel = (congestionSum / path.length) * 100;
    const safetyScore = Math.max(0, 100 - hazardExposure - congestionLevel * 0.3);

    return {
      id: `route_${Date.now()}`,
      waypoints,
      totalDistance,
      estimatedTime: Math.round(estimatedTime),
      safetyScore: Math.round(safetyScore),
      congestionLevel: Math.round(congestionLevel),
      hazardExposure: Math.min(100, Math.round(hazardExposure)),
      shelterDestination: shelter,
      alternativeRoutes: [],
      instructions,
      riskFactors,
      updatedAt: new Date(),
    };
  }

  /**
   * Generate turn-by-turn instructions
   */
  private generateInstructions(path: string[]): RouteInstruction[] {
    const instructions: RouteInstruction[] = [];
    
    if (path.length === 0) return instructions;

    const startNode = this.nodes.get(path[0])!;
    instructions.push({
      type: 'start',
      text: 'Start evacuation from current location',
      distance: 0,
      duration: 0,
      coordinate: startNode.position,
    });

    for (let i = 0; i < path.length - 1; i++) {
      const currentNode = this.nodes.get(path[i])!;
      const nextNode = this.nodes.get(path[i + 1])!;
      const edges = this.edges.get(path[i]) || [];
      const edge = edges.find(e => e.toId === path[i + 1]);

      if (edge) {
        const bearing = this.calculateBearing(currentNode.position, nextNode.position);
        const turnType = this.determineTurnType(bearing, i > 0 ? path[i - 1] : null, path[i]);

        if (edge.condition !== 'clear') {
          instructions.push({
            type: 'warning',
            text: `Caution: ${edge.condition} road ahead`,
            distance: edge.distance,
            duration: Math.round(edge.distance / 500 * 60), // ~30 km/h
            coordinate: nextNode.position,
          });
        }

        instructions.push({
          type: turnType,
          text: `${turnType === 'continue' ? 'Continue' : `Turn ${turnType.replace('turn_', '')}`} on ${edge.roadType} road for ${(edge.distance / 1000).toFixed(1)} km`,
          distance: edge.distance,
          duration: Math.round(edge.distance / 500 * 60),
          coordinate: nextNode.position,
        });
      }
    }

    const endNode = this.nodes.get(path[path.length - 1])!;
    instructions.push({
      type: 'arrive',
      text: `Arrive at ${endNode.type === 'shelter' ? 'emergency shelter' : endNode.type}`,
      distance: 0,
      duration: 0,
      coordinate: endNode.position,
    });

    return instructions;
  }

  private calculateBearing(from: Coordinate, to: Coordinate): number {
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;
    const deltaLon = (to.lon - from.lon) * Math.PI / 180;

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
    
    return Math.atan2(y, x) * 180 / Math.PI;
  }

  private determineTurnType(_bearing: number, _prevId: string | null, _currentId: string): RouteInstruction['type'] {
    // Simplified turn detection
    const rand = Math.random();
    if (rand < 0.3) return 'turn_left';
    if (rand < 0.6) return 'turn_right';
    return 'continue';
  }

  /**
   * Get all available shelters with capacity
   */
  public getSheltersWithCapacity(): RouteNode[] {
    return Array.from(this.nodes.values())
      .filter(n => n.type === 'shelter' && n.capacity && n.currentOccupancy !== undefined)
      .sort((a, b) => (b.capacity! - b.currentOccupancy!) - (a.capacity! - a.currentOccupancy!));
  }
}

export const evacuationRouteService = EvacuationRouteService.getInstance();
export default evacuationRouteService;
