import { FolderSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyState = ({ heading, message, actionText, onAction }) => {
  return (
    <div className="flex justify-center">
      <div className="border rounded-xl p-10 text-center shadow-sm bg-white dark:bg-zinc-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <FolderSearch className="w-8 h-8 text-gray-500" />
        </div>

        <h3 className="mt-6 text-lg font-semibold text-gray-800 dark:text-gray-200">
          {heading}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          {message || "Start by performing a search or adding something new."}
        </p>

        {actionText && (
          <Button onClick={onAction} className="mt-6 w-full">
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
