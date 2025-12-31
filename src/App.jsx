import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import { Tools } from './constants';
import './index.css';

function App() {
  const [tool, setTool] = useState(Tools.DRAW);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const clearCanvas = () => {
    setElements([]);
  };

  return (
    <div className="canvas-container">
      <Toolbar
        tool={tool}
        setTool={setTool}
        onClear={clearCanvas}
      />

      <Canvas
        tool={tool}
        camera={camera}
        setCamera={setCamera}
        zoom={zoom}
        setZoom={setZoom}
        elements={elements}
        setElements={setElements}
        currentElement={currentElement}
        setCurrentElement={setCurrentElement}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        startPos={startPos}
        setStartPos={setStartPos}
      />

      <div className="instructions">
        {tool === Tools.PAN ? 'Drag to move around' : 'Click and drag to draw'}
      </div>
    </div>
  );
}

export default App;
