"use client";
import { useState } from "react";
import BuyNowModal from "./BuyNowModal";

export default function BuyNowButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        Buy Now
      </button>

      {open && <BuyNowModal onClose={() => setOpen(false)} />}
    </>
  );
}
