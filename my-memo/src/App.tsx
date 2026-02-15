import { useState, useCallback, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { MainView } from "./components/MainView";
import { useMemos } from "./hooks/useMemos";

export default function App() {
  const {
    memos,
    deletedMemos,
    currentMemo,
    editingId,
    editingDeletedId,
    showTrash,
    setEditingId,
    setEditingDeletedId,
    setShowTrash,
    updateContent,
    createNewMemo,
    deleteMemo,
    restoreMemo,
    handlePaste,
  } = useMemos();

  const [showPreview, setShowPreview] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [editorWidth, setEditorWidth] = useState(50);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingEditor, setIsResizingEditor] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizingSidebar) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth < 500) setSidebarWidth(newWidth);
      }
      if (isResizingEditor && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left - sidebarWidth;
        const mainWidth = rect.width - sidebarWidth;
        const newPercent = (relativeX / mainWidth) * 100;
        if (newPercent > 20 && newPercent < 80) setEditorWidth(newPercent);
      }
    },
    [isResizingSidebar, isResizingEditor, sidebarWidth],
  );

  useEffect(() => {
    const stop = () => {
      setIsResizingSidebar(false);
      setIsResizingEditor(false);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stop);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className={`flex h-screen w-screen bg-white text-gray-800 overflow-hidden ${isResizingSidebar || isResizingEditor ? "select-none cursor-col-resize" : ""}`}
    >
      <Sidebar
        width={sidebarWidth}
        memos={memos}
        deletedMemos={deletedMemos}
        editingId={editingId}
        editingDeletedId={editingDeletedId}
        showTrash={showTrash}
        onSelectMemo={setEditingId}
        onSelectDeletedMemo={setEditingDeletedId}
        onDeleteMemo={deleteMemo}
        onToggleTrash={() => {
          setShowTrash(!showTrash);
          setEditingDeletedId(null);
        }}
        onResizeMouseDown={() => setIsResizingSidebar(true)}
      />

      <div className="flex-1 flex flex-col relative min-w-0">
        <MainView
          currentMemo={currentMemo}
          showTrash={showTrash}
          showPreview={showPreview}
          editorWidth={editorWidth}
          onUpdate={updateContent}
          onPaste={handlePaste}
          onTogglePreview={() => setShowPreview(!showPreview)}
          onRestore={restoreMemo}
          onResizeMouseDown={() => setIsResizingEditor(true)}
        />
        {!showTrash && (
          <button
            onClick={createNewMemo}
            className="absolute bottom-10 right-10 w-16 h-16 bg-[#2ecc71] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 text-3xl font-bold z-40"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
