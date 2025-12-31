import React, { useRef, useEffect, useState } from 'react';
import { Tools } from '../constants';

const Canvas = ({
    tool,
    camera,
    setCamera,
    zoom,
    setZoom,
    elements,
    setElements,
    currentElement,
    setCurrentElement,
    isDrawing,
    setIsDrawing,
    startPos,
    setStartPos
}) => {
    const canvasRef = useRef(null);
    const [writing, setWriting] = useState(null);
    const [textValue, setTextValue] = useState('');

    useEffect(() => {
        const resizeCanvas = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                render();
            }
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [elements, camera, currentElement, zoom]);

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - camera.x) / zoom,
            y: (e.clientY - rect.top - camera.y) / zoom,
        };
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const scaleFactor = 0.1;
        const direction = e.deltaY > 0 ? -1 : 1;
        const newZoom = Math.min(Math.max(zoom + direction * scaleFactor * zoom, 0.1), 10);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const mousePosWorldX = (mouseX - camera.x) / zoom;
        const mousePosWorldY = (mouseY - camera.y) / zoom;

        setZoom(newZoom);
        setCamera({
            x: mouseX - mousePosWorldX * newZoom,
            y: mouseY - mousePosWorldY * newZoom,
        });
    };

    const handleMouseDown = (e) => {
        const { x, y } = getMousePos(e);
        setIsDrawing(true);
        setStartPos({ x, y });

        if (tool === Tools.PAN) return;

        if (tool === Tools.TEXT) {
            setWriting({ x: e.clientX, y: e.clientY, worldX: x, worldY: y });
            setTextValue('');
            setIsDrawing(false);
            return;
        }

        let newElement = {
            type: tool,
            startX: x,
            startY: y,
            color: '#ffffff',
            points: [{ x, y }],
        };
        setCurrentElement(newElement);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;

        if (tool === Tools.PAN) {
            setCamera((prev) => ({
                x: prev.x + e.movementX,
                y: prev.y + e.movementY,
            }));
            return;
        }

        const { x, y } = getMousePos(e);

        setCurrentElement((prev) => {
            if (!prev) return null;
            if (tool === Tools.DRAW) {
                return { ...prev, points: [...prev.points, { x, y }] };
            }
            return { ...prev, endX: x, endY: y };
        });
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (currentElement && tool !== Tools.PAN) {
            setElements((prev) => [...prev, currentElement]);
        }
        setCurrentElement(null);
    };

    const drawGrid = (ctx, canvas) => {
        const gridSize = 50;
        const left = -camera.x / zoom;
        const top = -camera.y / zoom;
        const right = (canvas.width - camera.x) / zoom;
        const bottom = (canvas.height - camera.y) / zoom;

        const startX = Math.floor(left / gridSize) * gridSize;
        const startY = Math.floor(top / gridSize) * gridSize;

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1 / zoom;

        for (let x = startX; x <= right; x += gridSize) {
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
        }
        for (let y = startY; y <= bottom; y += gridSize) {
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
        }
        ctx.stroke();
    };

    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(camera.x, camera.y);
        ctx.scale(zoom, zoom);

        drawGrid(ctx, canvas);

        const allElements = currentElement ? [...elements, currentElement] : elements;

        allElements.forEach((el) => {
            ctx.beginPath();
            ctx.strokeStyle = el.color || '#ffffff';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (el.type === Tools.DRAW) {
                if (el.points.length < 2) return;
                ctx.moveTo(el.points[0].x, el.points[0].y);
                el.points.forEach((p) => ctx.lineTo(p.x, p.y));
                ctx.stroke();
            } else if (el.type === Tools.ANCHOR_LINE) {
                ctx.moveTo(el.startX, el.startY);
                ctx.lineTo(el.endX ?? el.startX, el.endY ?? el.startY);
                ctx.stroke();
            } else if (el.type === Tools.RECT) {
                const cx = el.startX;
                const cy = el.startY;
                const ex = el.endX ?? cx;
                const ey = el.endY ?? cy;
                const w = Math.abs(ex - cx) * 2;
                const h = Math.abs(ey - cy) * 2;
                ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
            } else if (el.type === Tools.CIRCLE) {
                const cx = el.startX;
                const cy = el.startY;
                const ex = el.endX ?? cx;
                const ey = el.endY ?? cy;
                const radius = Math.sqrt(Math.pow(ex - cx, 2) + Math.pow(ey - cy, 2));
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (el.type === Tools.TEXT) {
                ctx.font = `${20}px Inter`;
                ctx.fillStyle = el.color || '#ffffff';
                ctx.fillText(el.text, el.startX, el.startY);
            }
        });

        ctx.restore();
    };

    useEffect(() => {
        render();
    }, [elements, camera, currentElement, zoom]);

    const handleTextSubmit = () => {
        if (textValue.trim()) {
            setElements(prev => [...prev, {
                type: Tools.TEXT,
                startX: writing.worldX,
                startY: writing.worldY,
                text: textValue,
                color: '#ffffff'
            }]);
        }
        setWriting(null);
        setTextValue('');
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            />
            {writing && (
                <textarea
                    autoFocus
                    className="text-input"
                    style={{
                        position: 'absolute',
                        left: writing.x,
                        top: writing.y,
                        font: `${20 * zoom}px Inter`,
                        color: '#ffffff',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        padding: 0,
                        margin: 0,
                        overflow: 'hidden',
                        whiteSpace: 'pre',
                        zIndex: 1000,
                    }}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    onBlur={handleTextSubmit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleTextSubmit();
                        }
                    }}
                />
            )}
        </>
    );
};

export default Canvas;
