"use client";

import React from "react";
import ItemRow from "./ItemRow";
import { PlusCircle } from "lucide-react";

export default function ReferenceItemsEditor({
  items = [],
  replaceItems = [],
  addItem = () => {},
  updateItem = () => {},
  deleteItem = () => {},
  updateReplacement = () => {},
  deleteReplacement = () => {},
}) {
  return (
    <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Replace Items (Reference → Replacement)
        </h3>

        <button
          onClick={addItem}
          className="px-3 py-1 text-sm bg-white border rounded flex items-center gap-2"
        >
          <PlusCircle size={16} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
        <div>Detected in Reference</div>
        <div>Replace With</div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">No items detected yet.</p>
        ) : (
          items.map((item, idx) => (
            <ItemRow
              key={idx}
              item={item}
              idx={idx}
              replaceItems={replaceItems}
              onChangeItem={updateItem}
              onChangeReplace={updateReplacement}
              onDeleteReplace={deleteReplacement}
              onDeleteItem={deleteItem}
            />
          ))
        )}
      </div>
    </div>
  );
}
