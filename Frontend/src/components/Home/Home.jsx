import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Banner from "./Banner";
import axios from "axios";
import Sidebar from "./Sidebar";
import NewsLetter from "./NewsLetter";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const { isAuthorized, username } = useSelector((state) => state.auth);
  const [editingAdId, setEditingAdId] = useState(null);
  const navigate = useNavigate();
  const [editedAd, setEditedAd] = useState({
    title: "",
    description: "",
    price: 0,
    image: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);

  const userId = parseInt(localStorage.getItem("userId"));
  const user = localStorage.getItem("user");

  const handleInputImageChange = (e) => {
    const { name, value } = e.target;
    setEditedAd((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditedAd((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const BACKEND_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/products`, {
          withCredentials: true,
        });

        console.log("Fetched ads:", res.data);

        setAdvertisements(res.data);
      } catch (error) {
        console.error("Error fetching advertisements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  if (!isAuthorized) return <Navigate to="/login" />;

  const handleEdit = (ad) => {
    setEditingAdId(ad.id);
    setEditedAd({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      price: ad.price,
    });
  };

  const handleSaveEdit = async () => {
    const id = editedAd.id;
    console.log("Saving advertisement with ID:", id);

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("title", editedAd.title);
      formData.append("description", editedAd.description);
      formData.append("price", editedAd.price);

      if (editedAd.image) {
        formData.append("image", editedAd.image);
      }

      const response = await axios.put(
        `${BACKEND_URL}/products/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Advertisement updated successfully:", response.data);

      setAdvertisements((prev) =>
        prev.map((ad) => (ad.id === id ? response.data : ad))
      );

      setEditingAdId(null);
      toast.success("Advertisement updated successfully");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error updating advertisement: " + error.message);
      }

      setEditingAdId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingAdId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/products/${id}`, {
        withCredentials: true,
      });

      setAdvertisements((prev) => prev.filter((ad) => ad.id !== id));
      console.log("Fetched ads:", res.data);

      toast.success("Advertisement deleted successfully");
    } catch (error) {
      console.log(
        error.response?.data?.error || "Error deleting advertisement"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAd((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const filteredAdvertisements = statusFilter
    ? advertisements.filter(
        (ad) => (ad.status || "").toLowerCase() === statusFilter.toLowerCase()
      )
    : advertisements;

  const indexOfLastAd = currentPage * tasksPerPage;
  const indexOfFirstAd = indexOfLastAd - tasksPerPage;
  const currentAdvertisements = filteredAdvertisements.slice(
    indexOfFirstAd,
    indexOfLastAd
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredAdvertisements.length / tasksPerPage);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "https://via.placeholder.com/150";

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/uploads/")) {
      return `${BACKEND_URL}/products/images/${imageUrl.split("/").pop()}`;
    }

    if (!imageUrl.includes("/")) {
      return `${BACKEND_URL}/products/images/${imageUrl}`;
    }

    return `${BACKEND_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  const handleDragEnd = ({ destination, source }) => {
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const reordered = Array.from(advertisements);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    setAdvertisements(reordered);
    toast.success("Advertisement order updated");
  };

  return (
    <div>
      <Banner />
      <div className="bg-[#FAFAFA] md:grid grid-cols-4 gap-8 lg:px-24 px-4 py-12">
        <div className="bg-white p-4 rounded">
          <Sidebar />
        </div>

        <div className="col-span-2 bg-white p-6 rounded-sm shadow-md">
          <h2 className="text-2xl font-bold mb-4">Advertisements</h2>

          {isLoading ? (
            <p>Loading advertisements...</p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="advertisements">
                {(provided) => (
                  <ul
                    className="space-y-3"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {currentAdvertisements.length > 0 ? (
                      currentAdvertisements.map((ad, index) => {
                        const displayUrl = getImageUrl(ad.imageUrl);

                        return (
                          <Draggable
                            key={ad.id}
                            draggableId={String(ad.id)}
                            index={index}
                          >
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex flex-col md:flex-row md:items-start justify-between border p-3 rounded shadow-sm hover:shadow transition"
                              >
                                <div className="flex-1">
                                  {editingAdId === ad.id ? (
                                    <div className="space-y-2">
                                      <input
                                        type="text"
                                        name="title"
                                        value={editedAd.title}
                                        onChange={handleInputImageChange}
                                        className="w-full p-2 border rounded"
                                        placeholder="Advertisement Title"
                                      />
                                      <textarea
                                        name="description"
                                        value={editedAd.description}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        placeholder="Description"
                                        rows={3}
                                      />
                                      <input
                                        type="number"
                                        name="price"
                                        value={editedAd.price}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        placeholder="Price"
                                        step="0.01"
                                      />

                                      <div className="space-y-2">
                                        <input
                                          type="file"
                                          name="image"
                                          onChange={handleImageChange}
                                          className="w-full p-2 border rounded"
                                        />
                                        {editedAd.image && (
                                          <div className="mt-2">
                                            <strong>Selected Image:</strong>
                                            <img
                                              src={URL.createObjectURL(
                                                editedAd.image
                                              )}
                                              alt="Selected"
                                              className="w-32 h-32 object-cover mt-2"
                                            />
                                          </div>
                                        )}
                                      </div>
                                      {editedAd && (
                                        <div className="flex space-x-2">
                                          <button
                                            className="bg-green-500 text-white px-3 py-1 rounded"
                                            onClick={() => {
                                              console.log(
                                                "Saving ad with ID:",
                                                editedAd.id
                                              );
                                              handleSaveEdit(editedAd.id);
                                            }}
                                          >
                                            Save
                                          </button>
                                          <button
                                            className="bg-gray-300 px-3 py-1 rounded"
                                            onClick={handleCancelEdit}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-lg font-medium">
                                      <span className="cursor-move text-gray-500">
                                        ☰
                                      </span>
                                      <div className="w-24 h-24 rounded-md overflow-hidden">
                                        <img
                                          src={
                                            ad.imageUrl ||
                                            "https://via.placeholder.com/150"
                                          }
                                          alt={ad.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div>
                                        <div>{ad.title}</div>
                                        <div className="text-sm text-gray-600">
                                          {ad.description}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                          Price: ${ad.price}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                          Posted By: {ad.user?.name}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2 md:mt-0 justify-start md:justify-end">
                                  {userId !== ad.user?.id && (
                                    <button
                                      className="text-gray-500 hover:text-blue-600"
                                      onClick={() =>
                                        navigate(`/messages/${ad.user?.id}`)
                                      }
                                      title="Message"
                                    >
                                      <FaMessage />
                                    </button>
                                  )}

                                  {!editingAdId && userId === ad.user?.id && (
                                    <div className="flex space-x-2">
                                      <button
                                        className="text-gray-500 hover:text-blue-600"
                                        onClick={() => handleEdit(ad || ad.id)}
                                        title="Edit"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        className="text-gray-500 hover:text-red-600"
                                        onClick={() => handleDelete(ad.id)}
                                        title="Delete"
                                      >
                                        <FaTrashAlt />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </li>
                            )}
                          </Draggable>
                        );
                      })
                    ) : (
                      <p>No advertisements found</p>
                    )}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Pagination */}
          {filteredAdvertisements.length > tasksPerPage && (
            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded">
          <NewsLetter />
        </div>
      </div>
    </div>
  );
};

export default Home;
