import React, { ClipboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Memo {
  id: number;
  title: string;
  content: string;
}

interface MainViewProps {
  currentMemo: Memo | null;
  showTrash: boolean;
  showPreview: boolean;
  editorWidth: number;
  onUpdate: (fields: Partial<Memo>) => void;
  onPaste: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
  onTogglePreview: () => void;
  onRestore: (id: number) => void;
  onResizeMouseDown: () => void;
}

export const MainView: React.FC<MainViewProps> = ({
  currentMemo,
  showTrash,
  showPreview,
  editorWidth,
  onUpdate,
  onPaste,
  onTogglePreview,
  onRestore,
  onResizeMouseDown,
}) => {
  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const textarea = e.currentTarget;
      const text = textarea.value;
      const pos = textarea.selectionStart;
      const start = text.lastIndexOf(" ", pos) + 1;
      const end = text.indexOf(" ", pos);
      const url = text.substring(start, end === -1 ? text.length : end).trim();

      if (url.startsWith("http")) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  };

  if (!currentMemo)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 uppercase text-[10px] tracking-[0.2em] select-none">
        メモを選択してください
      </div>
    );

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* ヘッダー */}
      <header className="h-14 border-b flex items-center px-8 justify-between flex-shrink-0 bg-white">
        <input
          readOnly={showTrash}
          value={currentMemo.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="bg-transparent text-lg font-bold outline-none w-full text-gray-800"
          placeholder="無題"
        />
        <div className="flex items-center gap-3">
          {showTrash ? (
            <button
              onClick={() => onRestore(currentMemo.id)}
              className="flex-shrink-0 bg-[#2ecc71] text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-[#27ae60] transition-colors"
            >
              復元
            </button>
          ) : (
            <button
              onClick={onTogglePreview}
              className={`flex-shrink-0 px-3 py-1 rounded text-[10px] uppercase tracking-wider font-bold transition-all ${
                showPreview
                  ? "bg-[#2ecc71] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {showPreview ? "Preview Hide" : "Preview Show"}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* エディタ：text-sm (14px) に一段階アップ */}
        <textarea
          readOnly={showTrash}
          onPaste={onPaste}
          onClick={handleTextareaClick}
          title={!showTrash ? "Ctrl + クリックでURLを開く" : ""}
          style={{
            lineHeight: "1.2",
            width: showPreview && !showTrash ? `${editorWidth}%` : "100%",
          }}
          className="p-8 text-sm outline-none resize-none text-gray-700 bg-white min-w-0 custom-scrollbar"
          value={currentMemo.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="内容を入力..."
        />

        {showPreview && !showTrash && (
          <div
            onMouseDown={onResizeMouseDown}
            className="w-px cursor-col-resize bg-gray-200 hover:bg-[#2ecc71] transition-all flex-shrink-0"
          />
        )}

        {/* プレビュー：こちらも text-sm 相当に調整 */}
        {showPreview && (
          <div
            style={{ width: showTrash ? "100%" : `${100 - editorWidth}%` }}
            className="h-full overflow-y-auto p-8 bg-gray-50/20 min-w-0 custom-scrollbar"
          >
            <article className="prose prose-sm prose-slate max-w-none break-words prose-headings:font-bold prose-headings:text-gray-800">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline cursor-pointer"
                    />
                  ),
                  pre: ({ node, ...props }) => (
                    <div className="my-3 rounded bg-gray-100 p-3 border border-gray-200 overflow-x-auto">
                      <pre
                        {...props}
                        className="m-0 text-[13px] leading-relaxed"
                      />
                    </div>
                  ),
                  // 本文のサイズを 14px 相当に指定
                  p: ({ node, ...props }) => (
                    <p
                      {...props}
                      className="text-[14px] leading-relaxed my-3"
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li {...props} className="text-[14px] my-1" />
                  ),
                }}
              >
                {currentMemo.content}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </div>
  );
};
