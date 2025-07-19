import React from "react";
import { FaCalendar, FaClock, FaDollarSign, FaMapPin } from "react-icons/fa";
import { Link } from "react-router-dom";
const Card = ({ data }) => {
  const {
    title,
    description,
    status,
    _id
  } = data;

  const formattedDate = new Date(jobPostedOn).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <section className="card">
      <Link  to={`/job/${_id}`} className="flex gap-4 flex-col sm:flex-row items-start">
        {companyLogo?.path && (
          <img
            src={`http://localhost:4000/${companyLogo.path}`}
            width="100"
            height="100"
            alt={`${companyName} Logo`}
          />
        )}
        <div>
          <h4 className="text-primary mb-1">{companyName}</h4>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="text-primary/70 text-base flex flex-wrap gap-2 mb-2">
            <span className="flex items-start gap-2">
              <FaMapPin />
              {city}
            </span>
            <span className="flex items-start gap-2">
              <FaClock />
              {salaryType}
            </span>
            <span className="flex items-start gap-2">
              <FaDollarSign />
              {salaryFrom && salaryTo
                ? `${salaryFrom} - ${salaryTo}`
                : fixedSalary || "Salary Not Available"}
            </span>{" "}
            <span className="flex items-start gap-2">
              <FaCalendar />
              {formattedDate}
            </span>
          </div>
          <p className="text-base text-primary/70">{description}</p>
        </div>
      </Link>
    </section>
  );
};

export default Card;
