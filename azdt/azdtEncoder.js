const graphData = [
    { modelID: 'dtmi:example:Building;1', id: 'BuildingA', from: '', relationship: '' },
    { modelID: 'dtmi:example:Floor;1', id: 'Floor1', from: 'BuildingA', relationship: 'contains' },
    { modelID: 'dtmi:example:Floor;1', id: 'Floor0', from: 'BuildingA', relationship: 'contains' },
    { modelID: 'dtmi:example:Room;1', id: 'Room1', from: 'Floor1', relationship: 'contains' },
    { modelID: 'dtmi:example:Room;1', id: 'Room0', from: 'Floor0', relationship: 'contains' },
    // Add more graph data as needed
];

// Starting node,relation,Node 2
// Starting node,relation,Node 1
// Starting node,relation,Node 3
// Node 2,relation,Node 5
// Node 2,relation,Node 6
// Node 3,relation,Node 7
// Node 7,relation,Node 9
// Node 9,relation,End node
// Node 6,relation,End node
// Node 5,relation,End node
// Node 1,relation,Node 4
// Node 4,relation,Node 8
// Node 8,relation,End node

const graphData = [
    { modelID: 'dtmi:example:Starting node;1', id: 'Starting Node0', from: '', relationship: '' },
    { modelID: 'dtmi:example:Node1;1', id: 'Node10', from: 'StartingNode0', relationship: 'relation' },
    { modelID: 'dtmi:example:Node2;1', id: 'Node20', from: 'StartingNode0', relationship: 'relation' },
    { modelID: 'dtmi:example:Node3;1', id: 'Node30', from: 'StartingNode0', relationship: 'relation' },
];