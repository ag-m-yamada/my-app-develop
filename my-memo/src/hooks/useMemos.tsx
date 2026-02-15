import { useState, useEffect, useMemo, ClipboardEvent } from "react";
import TurndownService from "turndown";

const turndownService = new TurndownService();
const STORAGE_KEY = "markdown_memos_v_final_hover";
const TRASH_STORAGE_KEY = "markdown_memos_trash_v1";

export interface Memo {
  id: number;
  title: string;
  content: string;
}

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [deletedMemos, setDeletedMemos] = useState<Memo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDeletedId, setEditingDeletedId] = useState<number | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedTrash = localStorage.getItem(TRASH_STORAGE_KEY);
    if (saved) setMemos(JSON.parse(saved));
    if (savedTrash) setDeletedMemos(JSON.parse(savedTrash));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(deletedMemos));
  }, [memos, deletedMemos]);

  const currentMemo = useMemo(
    () =>
      showTrash
        ? deletedMemos.find((m) => m.id === editingDeletedId) || null
        : memos.find((m) => m.id === editingId) || null,
    [memos, deletedMemos, editingId, editingDeletedId, showTrash],
  );

  const updateContent = (fields: Partial<Memo>) => {
    if (!editingId || showTrash) return;
    setMemos((prev) =>
      prev.map((m) => (m.id === editingId ? { ...m, ...fields } : m)),
    );
  };

  const createNewMemo = () => {
    const newMemo = { id: Date.now(), title: "", content: "" };
    setMemos((prev) => [newMemo, ...prev]);
    setEditingId(newMemo.id);
    setShowTrash(false);
  };

  const deleteMemo = (id: number) => {
    const target = memos.find((m) => m.id === id);
    if (!target) return;
    setDeletedMemos((prev) => [target, ...prev]);
    setMemos((prev) => {
      const next = prev.filter((m) => m.id !== id);
      setEditingId(next.length > 0 ? next[0].id : null);
      return next;
    });
  };

  const restoreMemo = (id: number) => {
    const target = deletedMemos.find((m) => m.id === id);
    if (!target) return;
    setMemos((prev) => [target, ...prev]);
    setDeletedMemos((prev) => prev.filter((m) => m.id !== id));
    setEditingId(id);
    setEditingDeletedId(null);
    setShowTrash(false);
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (showTrash) return;
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      const markdown = turndownService.turndown(html);
      updateContent({
        content: currentMemo ? currentMemo.content + markdown : markdown,
      });
    }
  };

  return {
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
  };
};
