import React from "react";
import { FaEnvelopeOpenText, FaRocket } from "react-icons/fa";

const NewsLetter = () => {
  return (
    <div>
      <div>
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <FaEnvelopeOpenText />
          Stay Updated with NuMoves
        </h3>
        <p className="text-primary/75 text-base mb-4">
          Want the hottest deals, selling tips, or marketplace updates?
          Subscribe with your email and never miss out on new listings or
          exclusive offers in your buying and selling journey.
        </p>
        <div className="w-full space-y-4">
          <input
            type="text"
            name="email"
            id="email"
            placeholder="you@example.com"
            className="w-full block py-2 pl-3 border focus:outline-none rounded-sm"
          />
          <input
            type="submit"
            value={"Subscribe"}
            className="w-full block py-2 pl-3 border focus:outline-none bg-blue text-white rounded-sm cursor-pointer font-semibold"
          />
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
