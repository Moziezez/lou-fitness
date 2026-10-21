import { Suspense } from "react";
import { getReservedSeats } from "@/lib/courses/seats";

function Capacity({ capacity }) {
  if (!capacity) return null;
  return (
    <span>
      Up to {capacity} {capacity === 1 ? "participant" : "participants"}
    </span>
  );
}

async function Reserved({ sessionId, capacity }) {
  const reserved = await getReservedSeats();
  if (!reserved) return <Capacity capacity={capacity} />;
  const count = reserved.get(sessionId) ?? 0;
  return (
    <span>
      {capacity ? `${count}/${capacity}` : count} seats reserved
    </span>
  );
}

/**
 * "x/max seats reserved" for signed-in users; signed-out visitors see the
 * capacity only. Streams in, so it can sit inside cached pages.
 * @param {{ sessionId: string, capacity: number | null }} props
 */
export default function SeatCount({ sessionId, capacity }) {
  return (
    <Suspense fallback={<Capacity capacity={capacity} />}>
      <Reserved sessionId={sessionId} capacity={capacity} />
    </Suspense>
  );
}
