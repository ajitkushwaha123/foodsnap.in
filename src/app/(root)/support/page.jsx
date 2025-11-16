"use client";
import TicketForm from "@/components/ticket/ticket-form";
import React, { useEffect } from "react";
import { useTicket } from "@/store/hooks/useTicket";
import TicketTable from "@/components/ticket/ticket-card";

const Page = () => {
  const { tickets, loading, loadTickets } = useTicket();

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-12 px-4 sm:px-6 lg:px-12 space-y-10">
      <TicketForm />

      {/* {loading && (
        <div className="text-center text-gray-600 py-10">
          <p className="animate-pulse">Loading tickets...</p>
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-gray-400 mb-3 text-5xl">📭</div>
          <h3 className="text-xl font-semibold text-gray-700">
            No tickets found
          </h3>
          <p className="text-gray-500 mt-1">
            Create a ticket using the form above.
          </p>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </div>
      )} */}

      <TicketTable tickets={tickets} loading={loading} />
    </div>
  );
};

export default Page;
