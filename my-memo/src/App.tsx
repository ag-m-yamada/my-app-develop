import { useState, useCallback, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { MainView } from "./components/MainView";
import { useMemos } from "./hooks/useMemos";

export default function App() {
  const {
    memos,
    deletedMemos,
    folders,
    currentMemo,
    editingId,
    editingDeletedId,
    showTrash,
    expandedFolders,
    setEditingId,
    setEditingDeletedId,
    setShowTrash,
    updateContent,
    createNewMemo,
    deleteMemo,
    restoreMemo,
    createFolder,
    deleteFolder,
    updateFolderName,
    toggleFolderExpand,
    handlePaste,
  } = useMemos();

  const [showPreview, setShowPreview] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [editorWidth, setEditorWidth] = useState(50);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const [newlyCreatedFolderId, setNewlyCreatedFolderId] = useState<
    number | null
  >(null);

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
        folders={folders}
        editingId={editingId}
        editingDeletedId={editingDeletedId}
        showTrash={showTrash}
        expandedFolders={expandedFolders}
        newlyCreatedFolderId={newlyCreatedFolderId}
        onSelectMemo={setEditingId}
        onSelectDeletedMemo={setEditingDeletedId}
        onDeleteMemo={deleteMemo}
        onToggleTrash={() => {
          setShowTrash(!showTrash);
          setEditingDeletedId(null);
        }}
        onCreateFolder={(parentFolderId) => {
          const newFolderId = createFolder(parentFolderId);
          setNewlyCreatedFolderId(newFolderId);
        }}
        onDeleteFolder={deleteFolder}
        onUpdateFolderName={(folderId, newName, _parentFolderId) => {
          updateFolderName(folderId, newName);
          if (folderId === newlyCreatedFolderId) {
            setNewlyCreatedFolderId(null);
          }
        }}
        onToggleFolderExpand={toggleFolderExpand}
        onCreateMemoInFolder={(folderId) => createNewMemo(folderId)}
        onCreateMemo={() => createNewMemo()}
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
      </div>
    </div>
  );
}
