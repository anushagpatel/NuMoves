import React from 'react'


import { Link } from "react-router-dom";


const Sidebar = ({handleChange, handleClick}) => {

  return (
<div className="space-y-5">
  <h2 className="text-2xl font-extrabold">Commerce Unleashed</h2>
  <p className="text-primary/75 text-base mb-4">
  NuMoves connects buyers and sellers in real-time, making transactions smooth and transparent. 
  Sellers can list items instantly while buyers browse, negotiate, and purchase seamlessly. 
  Our platform keeps every deal moving from "listed" to "sold" with clear communication, 
  so you always know the status of your purchases and sales.
</p>

</div>

  )
}

export default Sidebar
