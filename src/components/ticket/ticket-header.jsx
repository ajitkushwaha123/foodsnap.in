import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const TicketHeader = () => {
  return (
    <div className="flex justify-between items-center w-[100%]">
      <div className="text-start mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Support & Feedback
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Have a question, issue, or feature request? We're here to help you.
        </p>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Ticket
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketHeader;
