import { Move, PenLine, Anchor, Square, Circle, Type, Trash2, Undo2 } from 'lucide-react';
import { Tools } from '../constants';

const Toolbar = ({ tool, setTool, onClear, onUndo, canUndo }) => {
    return (
        <div className="toolbar">
            <button
                className={`tool-button ${tool === Tools.PAN ? 'active' : ''}`}
                onClick={() => setTool(Tools.PAN)}
                title="Pan (Space + Drag)"
            >
                <Move size={20} />
            </button>
            <button
                className={`tool-button ${tool === Tools.DRAW ? 'active' : ''}`}
                onClick={() => setTool(Tools.DRAW)}
                title="Freehand"
            >
                <PenLine size={20} />
            </button>
            <button
                className={`tool-button ${tool === Tools.ANCHOR_LINE ? 'active' : ''}`}
                onClick={() => setTool(Tools.ANCHOR_LINE)}
                title="Anchored Line"
            >
                <Anchor size={20} />
            </button>
            <button
                className={`tool-button ${tool === Tools.RECT ? 'active' : ''}`}
                onClick={() => setTool(Tools.RECT)}
                title="Rectangle (Center)"
            >
                <Square size={20} />
            </button>
            <button
                className={`tool-button ${tool === Tools.CIRCLE ? 'active' : ''}`}
                onClick={() => setTool(Tools.CIRCLE)}
                title="Circle (Center)"
            >
                <Circle size={20} />
            </button>
            <button
                className={`tool-button ${tool === Tools.TEXT ? 'active' : ''}`}
                onClick={() => setTool(Tools.TEXT)}
                title="Text"
            >
                <Type size={20} />
            </button>
            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }} />
            <button
                className="tool-button"
                onClick={onUndo}
                title="Undo (Ctrl+Z)"
                disabled={!canUndo}
                style={{ opacity: canUndo ? 0.7 : 0.2, cursor: canUndo ? 'pointer' : 'default' }}
            >
                <Undo2 size={20} />
            </button>
            <button
                className="tool-button"
                onClick={onClear}
                title="Clear Canvas"
                style={{ opacity: 0.5 }}
            >
                <Trash2 size={20} />
            </button>
        </div>
    );
};

export default Toolbar;
