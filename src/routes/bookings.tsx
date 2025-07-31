import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { useState } from "react";
import { useZero } from "@/ui/use-zero";

export const Route = createFileRoute("/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  const { data: session, isPending } = useSession();
  
  if (isPending) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!session) {
    return <div className="flex h-screen items-center justify-center">Please log in.</div>;
  }
  
  return <BookingsManager />;
}

function BookingsManager() {
  const { data: session } = useSession();
  const [allBookings] = useQuery(queries.userBookings(session));
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const filteredBookings = allBookings.filter(booking => {
    if (filterStatus === "all") return true;
    return booking.status === filterStatus;
  });

  const upcomingBookings = filteredBookings.filter(
    booking => new Date(booking.startTime) > new Date()
  );
  
  const pastBookings = filteredBookings.filter(
    booking => new Date(booking.startTime) <= new Date()
  );

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-white border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
        <div className="text-xl font-extrabold tracking-tight mb-3">
          BookMe
        </div>
        <nav className="flex flex-col divide-y divide-neutral-200">
          <Link to="/" className="nav-btn">Dashboard</Link>
          <Link to="/availability" className="nav-btn">Availability</Link>
          <Link to="/bookings" className="nav-btn">Bookings</Link>
        </nav>
        <div className="mt-auto text-xs text-neutral-400">
          © 2025 BookMe
        </div>
      </aside>

      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input text-sm"
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {upcomingBookings.length > 0 && (
              <BookingsSection
                title="Upcoming Bookings"
                bookings={upcomingBookings}
                isUpcoming={true}
              />
            )}
            
            {pastBookings.length > 0 && (
              <BookingsSection
                title="Past Bookings"
                bookings={pastBookings}
                isUpcoming={false}
              />
            )}
            
            {filteredBookings.length === 0 && (
              <div className="card text-center py-12">
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-neutral-600 mb-4">
                  {filterStatus === "all" 
                    ? "You don't have any bookings yet."
                    : `No ${filterStatus} bookings found.`
                  }
                </p>
                <Link to="/" className="btn btn-yellow">
                  Create Event Type
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function BookingsSection({ title, bookings, isUpcoming }: {
  title: string;
  bookings: any[];
  isUpcoming: boolean;
}) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {bookings
          .sort((a, b) => {
            const dateA = new Date(a.startTime).getTime();
            const dateB = new Date(b.startTime).getTime();
            return isUpcoming ? dateA - dateB : dateB - dateA;
          })
          .map((booking) => (
            <BookingCard key={booking.id} booking={booking} isUpcoming={isUpcoming} />
          ))}
      </div>
    </div>
  );
}

function BookingCard({ booking, isUpcoming }: {
  booking: any;
  isUpcoming: boolean;
}) {
  const zero = useZero();
  const [showActions, setShowActions] = useState<boolean>(false);
  
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await zero.mutate.cancelBooking({ id: booking.id });
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-neutral-100 text-neutral-800";
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString([], { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const { date, time } = formatDateTime(booking.startTime);

  return (
    <div className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium">{booking.eventType?.title || "Unknown Event"}</h3>
            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">Guest:</span>
              <span>{booking.guestName}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Date:</span>
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Time:</span>
              <span>{time}</span>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">Email:</span>
              <a 
                href={`mailto:${booking.guestEmail}`}
                className="text-blue-600 hover:underline"
              >
                {booking.guestEmail}
              </a>
            </div>
          </div>
          
          {booking.notes && (
            <div className="mt-2 text-sm">
              <span className="font-medium text-neutral-700">Notes:</span>
              <p className="text-neutral-600 mt-1">{booking.notes}</p>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-neutral-400 hover:text-neutral-600 p-1"
          >
            ⋮
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-10">
              <a
                href={`mailto:${booking.guestEmail}?subject=Re: ${booking.eventType?.title}`}
                className="block px-4 py-2 text-sm hover:bg-neutral-50"
                onClick={() => setShowActions(false)}
              >
                Send Email
              </a>
              {isUpcoming && booking.status === "confirmed" && (
                <button
                  onClick={handleCancel}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}