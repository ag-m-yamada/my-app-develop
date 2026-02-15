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
  if (!currentMemo)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-200 uppercase text-xs tracking-widest select-none">
        メモを選択してください
      </div>
    );

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <header className="h-16 border-b flex items-center px-10 justify-between flex-shrink-0">
        <input
          readOnly={showTrash}
          value={currentMemo.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="bg-transparent text-xl font-bold outline-none w-full"
          placeholder="無題"
        />
        {showTrash ? (
          <button
            onClick={() => onRestore(currentMemo.id)}
            className="flex-shrink-0 bg-[#2ecc71] text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:bg-[#27ae60] transition-colors"
          >
            復元する
          </button>
        ) : (
          <button
            onClick={onTogglePreview}
            className={`flex-shrink-0 ml-4 px-4 py-2 rounded-full text-xs font-bold transition-all ${showPreview ? "bg-[#2ecc71] text-white shadow-sm" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
          >
            {showPreview ? "プレビュー隠す" : "プレビュー出す"}
          </button>
        )}
      </header>
      <div className="flex-1 flex overflow-hidden min-w-0">
        <textarea
          readOnly={showTrash}
          onPaste={onPaste}
          style={{
            width: showPreview && !showTrash ? `${editorWidth}%` : "100%",
          }}
          className="p-10 text-base outline-none resize-none leading-relaxed text-gray-700 bg-white min-w-0"
          value={currentMemo.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="内容..."
        />
        {showPreview && !showTrash && (
          <div
            onMouseDown={onResizeMouseDown}
            className="w-1.5 cursor-col-resize bg-gray-50 border-x hover:bg-[#2ecc71]/30 transition-colors flex-shrink-0"
          />
        )}
        {showPreview && (
          <div
            style={{ width: showTrash ? "100%" : `${100 - editorWidth}%` }}
            className="h-full overflow-y-auto p-10 bg-gray-50/30 min-w-0"
          >
            <article className="prose prose-slate max-w-none break-words overflow-wrap-anywhere prose-headings:mb-4 prose-p:leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 rounded-lg">
                      <pre {...props} />
                    </div>
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
