"use client";

import React from "react";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  FileWarning,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axios from "axios";

const ImageOptions = ({ imageId }) => {
  const saveReport = async (imageId, key) => {
    try {
      const response = await axios.post("/api/image/report", { imageId, key });
      return response.data;
    } catch (err) {
      console.error("Report save failed:", err);
    }
  };

  const handleReport = async ({ key, reason }) => {
    toast.success(`Reported for: ${reason}`);
    await saveReport(imageId, key);
  };

  const rejectionReasons = [
    { title: "Reject On Zomato", key: "rejected_on_zomato", icon: FileWarning },
    {
      title: "Rejected On Swiggy",
      key: "rejected_on_swiggy",
      icon: FileWarning,
    },
    { title: "Rejected On Both", key: "rejected_on_both", icon: FileWarning },
    {
      title: "Copyright Violation",
      key: "copyright_violation",
      icon: AlertTriangle,
    },
    { title: "Other", key: "other", icon: AlertTriangle },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="p-2 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm hover:scale-105 transition-transform"
        >
          <MoreHorizontal className="w-5 h-5 text-black dark:text-white" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* <DropdownMenuItem onClick={() => toast("View clicked")} key="view">
          <Eye className="w-4 h-4 mr-2" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast("Edit clicked")} key="edit">
          <Edit className="w-4 h-4 mr-2" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast("Delete clicked")} key="delete">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem> */}

        {/* <DropdownMenuSeparator /> */}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <AlertTriangle className="w-4 h-4 mr-2" /> Report Image
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {rejectionReasons.map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <DropdownMenuItem
                  key={reason.key}
                  onClick={() =>
                    handleReport({
                      key: reason.key,
                      reason: reason.title,
                    })
                  }
                >
                  <Icon className="w-4 h-4 mr-2 text-red-500" />
                  {idx + 1}. {reason.title}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ImageOptions;
