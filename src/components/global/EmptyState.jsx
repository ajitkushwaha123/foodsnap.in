import { Button } from "@/components/ui/button";

const EmptyState = ({ heading, message, actionText, onAction }) => {
  return (
    <div className="flex justify-center my-5">
      <div className="border rounded-xl p-6 sm:p-10 text-center shadow-sm bg-white dark:bg-zinc-900 w-full">
        <div className="flex justify-center">
          <img
            src="/assets/out-of-credits.png"
            alt="Out of credits"
            className="w-40 sm:w-48 h-auto mx-auto object-contain"
          />
        </div>

        {/* Heading */}
        {heading && (
          <h3 className="mt-6 text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
            {heading}
          </h3>
        )}

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 leading-relaxed px-2">
          {message ||
            "You are out of credits. Please upgrade your plan to continue."}
        </p>

        {/* Action Button */}
        {actionText && (
          <Button onClick={onAction} className="mt-6 w-full sm:w-auto px-6">
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
