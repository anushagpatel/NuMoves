import React, { useState } from "react";

const Banner = ({}) => {
  return (
    <>
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 md:py-5 py-7">
        <h1 className="text-5xl font-bold text-primary mb-3">
          Start your <span className="text-blue">buying & selling</span> journey
          today
        </h1>
        <p className="text-lg text-black/70 mb-8">
          Discover great deals, connect with buyers, and grow your business with
          a platform designed to make commerce simple, fast, and rewarding.
        </p>
      </div>
    </>
  );
};

export default Banner;
