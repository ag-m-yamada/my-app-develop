import { useState, useEffect, useMemo, ClipboardEvent } from "react";
import TurndownService from "turndown";

const turndownService = new TurndownService();
const STORAGE_KEY = "markdown_memos_v_final_hover";
const TRASH_STORAGE_KEY = "markdown_memos_trash_v1";
const FOLDERS_STORAGE_KEY = "markdown_memos_folders_v1";

export interface Memo {
  id: number;
  title: string;
  content: string;
  folderId?: number | null;
}

export interface Folder {
  id: number;
  name: string;
  memos: Memo[];
  folders: Folder[];
}

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [deletedMemos, setDeletedMemos] = useState<Memo[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDeletedId, setEditingDeletedId] = useState<number | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedTrash = localStorage.getItem(TRASH_STORAGE_KEY);
    const savedFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (saved) setMemos(JSON.parse(saved));
    if (savedTrash) setDeletedMemos(JSON.parse(savedTrash));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(deletedMemos));
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  }, [memos, deletedMemos, folders]);

  const currentMemo = useMemo(() => {
    if (showTrash) {
      return deletedMemos.find((m) => m.id === editingDeletedId) || null;
    }

    // トップレベルのメモを探す
    const topLevelMemo = memos.find((m) => m.id === editingId);
    if (topLevelMemo) return topLevelMemo;

    // フォルダ内のメモを再帰的に探す
    const findMemoInFolders = (folders: Folder[]): Memo | null => {
      for (const folder of folders) {
        const found = folder.memos.find((m) => m.id === editingId);
        if (found) return found;
        const foundInNested = findMemoInFolders(folder.folders);
        if (foundInNested) return foundInNested;
      }
      return null;
    };

    return findMemoInFolders(folders);
  }, [memos, deletedMemos, folders, editingId, editingDeletedId, showTrash]);

  const updateContent = (fields: Partial<Memo>) => {
    if (!editingId || showTrash) return;

    // トップレベルのメモを更新
    setMemos((prev) =>
      prev.map((m) => (m.id === editingId ? { ...m, ...fields } : m)),
    );

    // フォルダ内のメモを更新
    const updateMemoInFolders = (folders: Folder[]): Folder[] => {
      return folders.map((folder) => ({
        ...folder,
        memos: folder.memos.map((m) =>
          m.id === editingId ? { ...m, ...fields } : m,
        ),
        folders: updateMemoInFolders(folder.folders),
      }));
    };
    setFolders((prev) => updateMemoInFolders(prev));
  };

  const createNewMemo = (folderId?: number | null) => {
    const newMemo: Memo = {
      id: Date.now(),
      title: "",
      content: "",
      folderId: folderId || null,
    };

    if (folderId) {
      const addMemoToFolder = (folders: Folder[]): Folder[] => {
        return folders.map((folder) =>
          folder.id === folderId
            ? { ...folder, memos: [newMemo, ...folder.memos] }
            : { ...folder, folders: addMemoToFolder(folder.folders) },
        );
      };
      setFolders((prev) => addMemoToFolder(prev));
    } else {
      setMemos((prev) => [newMemo, ...prev]);
    }
    setEditingId(newMemo.id);
    setShowTrash(false);
  };

  const deleteMemo = (id: number) => {
    const targetInMemos = memos.find((m) => m.id === id);

    // ネストされたフォルダ内を含めてメモを検索
    const findMemoInFolders = (folders: Folder[]): Memo | undefined => {
      for (const folder of folders) {
        const found = folder.memos.find((m) => m.id === id);
        if (found) return found;
        const foundInNested = findMemoInFolders(folder.folders);
        if (foundInNested) return foundInNested;
      }
      return undefined;
    };

    const targetInFolders = findMemoInFolders(folders);
    let target = targetInMemos || targetInFolders;

    if (!target) return;

    setDeletedMemos((prev) => [target!, ...prev]);

    if (targetInMemos) {
      setMemos((prev) => {
        const next = prev.filter((m) => m.id !== id);
        setEditingId(next.length > 0 ? next[0].id : null);
        return next;
      });
    } else {
      // ネストされたフォルダからメモを削除
      const removeFromFolders = (folders: Folder[]): Folder[] => {
        return folders.map((folder) => ({
          ...folder,
          memos: folder.memos.filter((m) => m.id !== id),
          folders: removeFromFolders(folder.folders),
        }));
      };
      setFolders((prev) => removeFromFolders(prev));
      setEditingId(null);
    }
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

  const createFolder = (parentFolderId?: number | null): number => {
    const newFolder: Folder = {
      id: Date.now(),
      name: "無題",
      memos: [],
      folders: [],
    };

    if (parentFolderId) {
      // ネストされたフォルダを作成
      const addFolderToParent = (folders: Folder[]): Folder[] => {
        return folders.map((folder) =>
          folder.id === parentFolderId
            ? {
                ...folder,
                folders: [newFolder, ...folder.folders],
              }
            : { ...folder, folders: addFolderToParent(folder.folders) },
        );
      };
      setFolders((prev) => addFolderToParent(prev));
    } else {
      // トップレベルのフォルダを作成
      setFolders((prev) => [newFolder, ...prev]);
    }

    setExpandedFolders((prev) => new Set([...prev, newFolder.id]));
    return newFolder.id;
  };

  const deleteFolder = (folderId: number, parentFolderId?: number | null) => {
    if (!parentFolderId) {
      // トップレベルのフォルダを削除
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
    } else {
      // ネストされたフォルダを削除
      const removeFolderFromParent = (folders: Folder[]): Folder[] => {
        return folders.map((folder) =>
          folder.id === parentFolderId
            ? {
                ...folder,
                folders: folder.folders.filter((f) => f.id !== folderId),
              }
            : { ...folder, folders: removeFolderFromParent(folder.folders) },
        );
      };
      setFolders((prev) => removeFolderFromParent(prev));
    }
    setEditingId(null);
  };

  const updateFolderName = (folderId: number, newName: string) => {
    const updateName = (folders: Folder[]): Folder[] => {
      return folders.map((f) =>
        f.id === folderId
          ? { ...f, name: newName }
          : { ...f, folders: updateName(f.folders) },
      );
    };
    setFolders((prev) => updateName(prev));
  };

  const toggleFolderExpand = (folderId: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
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
  };
};
