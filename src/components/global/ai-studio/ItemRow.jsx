"use client";

import React from "react";
import { Trash, X } from "lucide-react";

export default function ItemRow({
  item = "",
  idx,
  replaceItems = [],
  onChangeItem = () => {},
  onChangeReplace = () => {},
  onDeleteReplace = () => {},
  onDeleteItem = () => {},
}) {
  return (
    <div className="grid grid-cols-2 gap-4 items-center bg-white p-3 rounded border">
      {/* Reference Item */}
      <div className="flex gap-3 items-center">
        <input
          value={item}
          onChange={(e) => onChangeItem(idx, e.target.value)}
          className="flex-1 border rounded px-3 py-2 bg-gray-50 text-sm"
        />
        <button
          onClick={() => onDeleteItem(idx)}
          className="p-2 bg-red-50 text-red-600 rounded"
        >
          <Trash size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={replaceItems[idx] || ""}
          onChange={(e) => onChangeReplace(idx, e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder={`Replace "${item}"...`}
        />

        {replaceItems[idx] && (
          <button
            onClick={() => onDeleteReplace(idx)}
            className="p-2 bg-gray-100 rounded text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
