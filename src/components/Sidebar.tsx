import React from "react";
import { Memo } from "../hooks/useMemos";

interface SidebarProps {
  width: number;
  memos: Memo[];
  deletedMemos: Memo[];
  editingId: number | null;
  editingDeletedId: number | null;
  showTrash: boolean;
  onSelectMemo: (id: number) => void;
  onSelectDeletedMemo: (id: number) => void;
  onDeleteMemo: (id: number) => void;
  onToggleTrash: () => void;
  onResizeMouseDown: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  memos,
  deletedMemos,
  editingId,
  editingDeletedId,
  showTrash,
  onSelectMemo,
  onSelectDeletedMemo,
  onDeleteMemo,
  onToggleTrash,
  onResizeMouseDown,
}) => {
  return (
    <aside
      style={{ width: `${width}px` }}
      className="bg-[#2c3e50] text-white flex flex-col relative flex-shrink-0 z-10 overflow-hidden"
    >
      <header className="px-6 py-8 border-b-2 border-[#3e5871] flex-shrink-0">
        <div className="text-xs font-bold tracking-widest text-gray-300">
          {showTrash ? "削除されたメモ" : "全てのメモ"}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pt-2 custom-scrollbar">
        {!showTrash
          ? memos.map((memo) => (
              <div
                key={memo.id}
                onClick={() => onSelectMemo(memo.id)}
                className={`group px-6 py-5 border-b border-white/5 cursor-pointer relative transition-all hover:bg-[#3e5871] ${editingId === memo.id ? "bg-[#3e5871] z-20 shadow-lg" : ""}`}
              >
                {editingId === memo.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#2ecc71]" />
                )}
                <p className="text-sm font-bold truncate pr-4">
                  {memo.title || "無題のメモ"}
                </p>

                {/* ゴミ箱に入れるヒントを追加 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMemo(memo.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-opacity"
                  title="ゴミ箱に入れる"
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
            ))
          : deletedMemos.map((memo) => (
              <div
                key={memo.id}
                onClick={() => onSelectDeletedMemo(memo.id)}
                className={`px-6 py-5 border-b border-white/5 cursor-pointer transition-colors ${editingDeletedId === memo.id ? "bg-red-900/20" : "hover:bg-white/5"}`}
              >
                <p className="text-sm font-bold truncate text-gray-300">
                  {memo.title || "無題"}
                </p>
              </div>
            ))}
      </div>

      <footer className="px-4 py-3 border-t-2 border-[#3e5871] flex-shrink-0 bg-[#2c3e50] flex items-center justify-around">
        <button
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="フォルダ（準備中）"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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
        </button>

        <button
          onClick={onToggleTrash}
          className={`p-2 transition-all rounded-lg ${showTrash ? "bg-red-500 text-white shadow-inner scale-95" : "text-gray-400 hover:text-white"}`}
          title={showTrash ? "メモ一覧に戻る" : "ゴミ箱を表示"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#2ecc71] z-50"
      />
    </aside>
  );
};
