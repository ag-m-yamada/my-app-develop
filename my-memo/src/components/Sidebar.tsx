import React, { useState } from "react";
import { Memo, Folder } from "../hooks/useMemos";

interface SidebarProps {
  width: number;
  memos: Memo[];
  deletedMemos: Memo[];
  folders: Folder[];
  editingId: number | null;
  editingDeletedId: number | null;
  showTrash: boolean;
  expandedFolders: Set<number>;
  newlyCreatedFolderId: number | null;
  onSelectMemo: (id: number) => void;
  onSelectDeletedMemo: (id: number) => void;
  onDeleteMemo: (id: number) => void;
  onToggleTrash: () => void;
  onCreateFolder: (parentFolderId?: number | null) => void;
  onDeleteFolder: (folderId: number, parentFolderId?: number | null) => void;
  onUpdateFolderName: (
    folderId: number,
    newName: string,
    parentFolderId?: number,
  ) => void;
  onToggleFolderExpand: (folderId: number) => void;
  onCreateMemoInFolder: (folderId: number) => void;
  onCreateMemo: () => void;
  onResizeMouseDown: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  memos,
  deletedMemos,
  folders,
  editingId,
  editingDeletedId,
  showTrash,
  expandedFolders,
  newlyCreatedFolderId,
  onSelectMemo,
  onSelectDeletedMemo,
  onDeleteMemo,
  onToggleTrash,
  onCreateFolder,
  onDeleteFolder,
  onUpdateFolderName,
  onToggleFolderExpand,
  onCreateMemoInFolder,
  onCreateMemo,
  onResizeMouseDown,
}) => {
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [folderNameInput, setFolderNameInput] = useState("");

  const startEditingFolder = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setFolderNameInput(folder.name);
  };

  const saveFolder = (folderId: number, parentFolderId?: number) => {
    if (folderNameInput.trim())
      onUpdateFolderName(folderId, folderNameInput, parentFolderId);
    setEditingFolderId(null);
  };

  React.useEffect(() => {
    if (newlyCreatedFolderId !== null) {
      setEditingFolderId(newlyCreatedFolderId);
      setFolderNameInput("");
    }
  }, [newlyCreatedFolderId]);

  // 共通アイコンコンポーネント
  const MemoIcon = ({ className = "h-4 w-4" }) => (
    <svg
      className={`${className} flex-shrink-0`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );

  const FolderIcon = ({ className = "h-4 w-4" }) => (
    <svg
      className={`${className} flex-shrink-0`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );

  const renderFolder = (
    folder: Folder,
    depth: number = 0,
    parentFolderId?: number,
  ) => {
    const paddingLeft = depth * 20 + 12;
    const isExpanded = expandedFolders.has(folder.id);

    return (
      <div key={`folder-${folder.id}`}>
        {/* フォルダ行：onClickで行全体の開閉を制御 */}
        <div
          className="group flex items-center justify-between hover:bg-[#3e5871] cursor-pointer py-2 pr-2"
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => onToggleFolderExpand(folder.id)}
        >
          <div className="flex items-center flex-1 min-w-0 gap-2">
            <div className="flex-shrink-0">
              <svg
                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <FolderIcon className="h-4 w-4 text-gray-300" />
            {editingFolderId === folder.id ? (
              <input
                autoFocus
                className="bg-[#3e5871] text-white px-1 rounded text-sm outline-none w-full border border-blue-400"
                value={folderNameInput}
                onClick={(e) => e.stopPropagation()} // 入力欄クリックで閉じないように
                onChange={(e) => setFolderNameInput(e.target.value)}
                onBlur={() => saveFolder(folder.id, parentFolderId)}
                onKeyDown={(e) =>
                  e.key === "Enter"
                    ? saveFolder(folder.id, parentFolderId)
                    : e.key === "Escape" && setEditingFolderId(null)
                }
              />
            ) : (
              <span className="text-sm font-bold truncate select-none">
                {folder.name}
              </span>
            )}
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation(); // フォルダ開閉を防ぐ
                startEditingFolder(folder);
              }}
              className="p-1 hover:text-blue-400"
            >
              {/* 名前編集用アイコン */}
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // フォルダ開閉を防ぐ
                onDeleteFolder(folder.id, parentFolderId);
              }}
              className="p-1 hover:text-red-400"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 展開時の中身 */}
        {isExpanded && (
          <div className="bg-black/5">
            {folder.folders.map((subfolder) =>
              renderFolder(subfolder, depth + 1, folder.id),
            )}
            {folder.memos.map((memo) => (
              <div
                key={memo.id}
                onClick={() => onSelectMemo(memo.id)}
                className={`group cursor-pointer relative py-2 pr-2 hover:bg-[#3e5871] flex items-center gap-2 ${editingId === memo.id ? "bg-[#3e5871]" : ""}`}
                style={{ paddingLeft: `${paddingLeft + 28}px` }}
              >
                {editingId === memo.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2ecc71]" />
                )}
                <MemoIcon />
                <span className="text-sm truncate block select-none">
                  {memo.title || "無題のメモ"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMemo(memo.id);
                  }}
                  className="ml-auto opacity-0 group-hover:opacity-100 hover:text-red-400"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {/* フォルダ内の作成ボタン */}
            <div
              className="flex gap-2 py-1.5"
              style={{ paddingLeft: `${paddingLeft + 28}px` }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateMemoInFolder(folder.id);
                }}
                className="p-1 text-[#2ecc71] hover:bg-[#2ecc71]/10 rounded transition-colors"
                title="新規メモ"
              >
                <MemoIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder(folder.id);
                }}
                className="p-1 text-[#2ecc71] hover:bg-[#2ecc71]/10 rounded transition-colors"
                title="新規フォルダ"
              >
                <FolderIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      style={{ width: `${width}px` }}
      className="bg-[#2c3e50] text-white flex flex-col h-full relative overflow-hidden border-r border-[#3e5871]"
    >
      <header className="p-4 border-b border-[#3e5871] flex-shrink-0">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {showTrash ? "Trash" : "Memos"}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!showTrash ? (
          <>
            {folders.map((folder) => renderFolder(folder))}
            {memos.map((memo) => (
              <div
                key={memo.id}
                onClick={() => onSelectMemo(memo.id)}
                className={`group px-4 py-3 border-b border-white/5 cursor-pointer relative hover:bg-[#3e5871] flex items-center gap-2 ${editingId === memo.id ? "bg-[#3e5871]" : ""}`}
              >
                {editingId === memo.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2ecc71]" />
                )}
                <MemoIcon />
                <div className="text-sm font-bold truncate">
                  {memo.title || "無題のメモ"}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMemo(memo.id);
                  }}
                  className="ml-auto opacity-0 group-hover:opacity-100 hover:text-red-400"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </>
        ) : (
          deletedMemos.map((memo) => (
            <div
              key={memo.id}
              onClick={() => onSelectDeletedMemo(memo.id)}
              className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-red-900/10 flex items-center gap-2 ${editingDeletedId === memo.id ? "bg-red-900/20" : ""}`}
            >
              <MemoIcon />
              <div className="text-sm truncate text-gray-400">
                {memo.title || "無題"}
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="p-2 border-t border-[#3e5871] flex justify-around bg-[#2c3e50] flex-shrink-0">
        <button
          onClick={onCreateMemo}
          className="p-2 text-gray-400 hover:text-[#2ecc71]"
          title="New Memo"
        >
          <MemoIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onCreateFolder()}
          className="p-2 text-gray-400 hover:text-[#2ecc71]"
          title="New Folder"
        >
          <FolderIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleTrash}
          className={`p-2 rounded transition-colors ${showTrash ? "text-red-500 bg-red-500/10" : "text-gray-400 hover:text-white"}`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </footer>

      <div
        onMouseDown={onResizeMouseDown}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#2ecc71] transition-colors"
      />
    </aside>
  );
};
