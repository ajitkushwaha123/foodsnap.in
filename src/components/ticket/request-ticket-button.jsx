"use client";
import React from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useTicket } from "@/store/hooks/useTicket";
import { useSearch } from "@/store/hooks/useSearch";

const RequestTicketButton = () => {
  const { creating, handleCreateTicket } = useTicket();
  const { query } = useSearch();

  const handleImageRequest = async () => {
    if (!query || creating) return;

    try {
      await handleCreateTicket({
        subject: `Image Request: ${query}`,
        message: "Requesting new images to be added to the library.",
      });
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  return (
    <Button
      type="button"
      disabled={creating}
      onClick={handleImageRequest}
      className={`
        hidden md:flex items-center justify-center gap-2
        px-5 py-2.5 text-sm sm:text-base font-medium rounded-md
        
       bg-[#0025cc] hover:bg-[#1c3eff]

        /* DARK MODE */
        dark:from-gray-100 dark:to-white dark:text-black
        dark:border-white/20 dark:shadow-[0_0_20px_rgba(255,255,255,0.04)]

        /* HOVER */
        hover:shadow-lg hover:shadow-black/10
        dark:hover:shadow-white/10 
        transition-all duration-300

        /* DISABLED */
        disabled:opacity-60 disabled:cursor-not-allowed
        disabled:hover:shadow-none
      `}
    >
      {creating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        "Request Image"
      )}
    </Button>
  );
};

export default RequestTicketButton;
