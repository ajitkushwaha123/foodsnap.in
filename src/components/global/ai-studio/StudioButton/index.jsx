import { Button } from "@/components/ui/button";
import { useSearch } from "@/store/hooks/useSearch";
import { setOpenStudio } from "@/store/slice/searchSlice";
import { Sparkles, X } from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";

const StudioButton = ({}) => {
  const dispatch = useDispatch();
  const { openStudio } = useSearch();

  const toggleStudio = () => {
    dispatch(setOpenStudio(!openStudio));
  };

  return (
    <div className="flex items-center">
      <Button
        onClick={toggleStudio}
        className="
          relative overflow-hidden rounded-sm
          bg-green-500
          text-white
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        <div className="flex items-center gap-2">
          {!openStudio && (
            <>
              <Sparkles className="w-4 h-4" />
            </>
          )}

          {openStudio && (
            <>
              <X className="w-4 h-4" />
            </>
          )}
        </div>

        <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-10 transition"></span>
      </Button>
    </div>
  );
};

export default StudioButton;
