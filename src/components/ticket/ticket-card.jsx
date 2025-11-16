"use client";

import React, { useState } from "react";
import { User, Calendar, Phone, Mail, AlertCircle, Inbox } from "lucide-react";

const statusStyles = {
  open: "bg-green-100 text-green-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-100 text-gray-600",
};

const priorityStyles = {
  high: "text-red-600 font-semibold",
  medium: "text-orange-500 font-medium",
  low: "text-gray-500",
};

export default function TicketTable({ tickets, loading }) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ---------------- LOADING SKELETON ----------------
  if (loading) {
    return (
      <div className="mt-6 rounded-xl overflow-hidden border border-gray-200 bg-white">
        <div className="bg-gray-50 px-5 py-4 border-b text-sm font-medium text-gray-700">
          Tickets
        </div>

        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse px-5 py-6 border-b flex items-center gap-6"
          >
            <div className="w-1/5 h-4 bg-gray-200 rounded"></div>
            <div className="w-1/5 h-4 bg-gray-200 rounded"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // ---------------- EMPTY STATE ----------------
  if (!tickets || tickets.length === 0) {
    return (
      <div className="mt-6 rounded-xl overflow-hidden border border-gray-200 bg-white">
        <div className="bg-gray-50 px-5 py-4 border-b text-sm font-medium text-gray-700">
          Tickets
        </div>

        <div className="py-20 text-center">
          <Inbox size={70} className="mx-auto text-gray-300" />
          <h3 className="text-lg font-semibold mt-4 text-gray-700">
            No Tickets Found
          </h3>
          <p className="text-gray-500 mt-1 text-sm">
            Once customers submit support requests, they will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[1100px] text-left">
        <thead className="bg-gray-50 text-gray-700 text-sm sticky top-0 z-10">
          <tr>
            <th className="px-5 py-4 font-medium">Subject</th>
            <th className="px-5 py-4 font-medium">Message</th>
            <th className="px-5 py-4 font-medium">User</th>
            <th className="px-5 py-4 font-medium">Priority</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium">Created Date</th>
          </tr>
        </thead>

        <tbody className="text-sm text-gray-700">
          {tickets.map((ticket) => {
            const fullMessage = ticket.details.message;
            const shortMessage =
              fullMessage.length > 100
                ? fullMessage.substring(0, 100) + "..."
                : fullMessage;

            const isExpanded = expandedRows[ticket._id];

            return (
              <tr
                key={ticket._id}
                className="border-t hover:bg-gray-50 transition"
              >
                {/* SUBJECT */}
                <td className="px-5 py-4 max-w-[200px] font-semibold text-gray-900 line-clamp-1">
                  {ticket.details.subject}
                </td>

                {/* MESSAGE */}
                <td className="px-5 py-4 max-w-[300px]">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {isExpanded ? fullMessage : shortMessage}
                  </p>

                  {fullMessage.length > 100 && (
                    <button
                      onClick={() => toggleRow(ticket._id)}
                      className="mt-1 text-blue-600 hover:underline text-xs font-medium"
                    >
                      {isExpanded ? "View Less" : "View More"}
                    </button>
                  )}
                </td>

                {/* USER INFO */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <User size={16} className="text-blue-600" />
                    {ticket.details.name}
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-xs mt-1">
                    <Phone size={14} />
                    {ticket.details.phone}
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-xs mt-1">
                    <Mail size={14} />
                    {ticket.details.email}
                  </div>
                </td>

                {/* PRIORITY */}
                <td className="px-5 py-4">
                  <div
                    className={`flex items-center gap-1 ${
                      priorityStyles[ticket.priority]
                    }`}
                  >
                    <AlertCircle size={16} />
                    {ticket.priority}
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-5 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      statusStyles[ticket.status]
                    }`}
                  >
                    {ticket.status.replace("-", " ")}
                  </span>
                </td>

                {/* CREATED DATE */}
                <td className="px-5 py-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
