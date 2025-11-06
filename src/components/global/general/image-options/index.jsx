"use client";

import React, { useState } from "react";
import { FileWarning, AlertTriangle, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axios from "axios";

const ImageOptions = ({ imageId }) => {
  const [loading, setLoading] = useState(false); 

  const saveReport = async (imageId, key) => {
    try {
      const response = await axios.post("/api/image/report", { imageId, key });
      return response.data;
    } catch (err) {
      console.error("Report save failed:", err);
      throw err;
    }
  };

  const handleReport = async ({ key, reason }) => {
    setLoading(true);
    toast.loading("Submitting report...", { id: "report" });

    try {
      const data = await saveReport(imageId, key);

      if (data?.success) {
        toast.success(`Successfully reported: ${reason}`, { id: "report" });
      } else {
        toast.error(data?.message || "Failed to submit report", {
          id: "report",
        });
      }
    } catch (err) {
      toast.error("Error submitting report. Please try again.", {
        id: "report",
      });
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
          className={`p-2 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm hover:scale-105 transition-transform ${
            loading ? "cursor-wait opacity-80" : ""
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-black dark:text-white" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {rejectionReasons.map((reason, idx) => {
          const Icon = reason.icon;
          return (
            <DropdownMenuItem
              key={reason.key}
              disabled={loading}
              onClick={() =>
                handleReport({
                  key: reason.key,
                  reason: reason.title,
                })
              }
              className={`${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <Icon className="w-4 h-4 mr-2 text-red-500" />
              {idx + 1}. {reason.title}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ImageOptions;
