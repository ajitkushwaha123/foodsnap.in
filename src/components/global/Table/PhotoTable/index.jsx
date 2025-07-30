import { useState } from "react";
import { Pencil, Trash, Save } from "lucide-react";
import { updateTitle, updateApproveStatus } from "@/helpers/api/image";

export default function PhotoTable({ columns = [], data = [] }) {
  const [items, setItems] = useState(data);
  const [editIndex, setEditIndex] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleDelete = (id) => {
    setItems(items.filter((item) => item._id !== id));
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditTitle(items[index].title);
  };

  const handleSave = async (index) => {
    const updatedItem = { ...items[index], title: editTitle };

    try {
      await updateTitle({ id: updatedItem._id, title: editTitle });

      const updatedItems = [...items];
      updatedItems[index] = updatedItem;
      setItems(updatedItems);
      setEditIndex(null);
    } catch (error) {
      console.error("Failed to update title", error);
      alert("Failed to update title");
    }
  };

  const toggleApproval = async (index) => {
    const updated = [...items];
    updated[index].approved = !updated[index].approved;
    setItems(updated);

    try {
      await updateApproveStatus({
        id: updated[index]._id,
        approved: updated[index].approved,
      });
    } catch (error) {
      console.error("Failed to update approval", error);
      alert("Failed to update approval");
    }
  };
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
      <table className="min-w-full text-sm text-left bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <thead className="bg-gray-100 dark:bg-gray-800 text-sm">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="p-3 font-semibold whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item._id}
              className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              {/* Image */}
              <td className="p-3">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
              </td>

              {/* Title */}
              <td className="p-3 max-w-[180px] w-[180px]">
                {editIndex === i ? (
                  <input
                    className="w-full px-2 py-1 rounded border dark:bg-gray-700 dark:text-white"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                ) : (
                  <span
                    className="block whitespace-nowrap overflow-hidden text-ellipsis"
                    title={item.title}
                  >
                    {item.title}
                  </span>
                )}
              </td>

              <td className="p-3 max-w-[160px]">
                <div className="font-medium truncate">{item.category}</div>
                <div className="text-xs text-gray-500 truncate">
                  {item.sub_category}
                </div>
              </td>

              {/* Tags */}
              <td className="p-3 max-w-[200px]">
                {[...item.manual_tags, ...item.auto_tags]
                  .slice(0, 3)
                  .map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs px-2 py-0.5 rounded mr-1 mb-1"
                    >
                      {tag}
                    </span>
                  ))}
                {[...item.manual_tags, ...item.auto_tags].length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{[...item.manual_tags, ...item.auto_tags].length - 3} more
                  </span>
                )}
              </td>

              {/* Status */}
              <td className="p-3 min-w-[150px] space-y-1">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={item.approved}
                    onChange={() => toggleApproval(i)}
                    className="accent-green-500"
                  />
                  Approved
                </label>
                {item.premium && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 px-2 py-0.5 rounded">
                    Premium
                  </span>
                )}
              </td>

              {/* Scores */}
              <td className="p-3 min-w-[150px] text-xs space-y-1">
                <div>Quality: {item.quality_score}</div>
                <div>Likes: {item.likes}</div>
              </td>

              {/* Actions */}
              <td className="p-3 flex gap-2 min-w-[80px]">
                {editIndex === i ? (
                  <button
                    onClick={() => handleSave(i)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Save size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(i)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
