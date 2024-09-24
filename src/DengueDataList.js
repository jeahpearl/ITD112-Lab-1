import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import Modal from 'react-modal';

Modal.setAppElement('#root');

const DengueDataList = () => {
  const [dengueData, setDengueData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    location: "",
    cases: "",
    deaths: "",
    date: "",
    regions: "",
    year: ""
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const dengueCollection = collection(db, "dengueData");
    const dengueSnapshot = await getDocs(dengueCollection);
    const dataList = dengueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDengueData(dataList);
    setFilteredData(dataList);
  };

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = dengueData.filter(entry =>
      Object.keys(entry).some(key =>
        String(entry[key]).toLowerCase().includes(lowercasedFilter)
      )
    );
    setFilteredData(filteredData);
  }, [searchTerm, dengueData]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleDelete = async (id) => {
    const dengueDocRef = doc(db, "dengueData", id);
    try {
      await deleteDoc(dengueDocRef);
      setDengueData(dengueData.filter((data) => data.id !== id));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setEditForm({
      location: data.location,
      cases: data.cases,
      deaths: data.deaths,
      date: new Date(data.date).toISOString().split('T')[0],  // Ensure date is formatted correctly for input
      regions: data.regions,
      year: data.year
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const dengueDocRef = doc(db, "dengueData", editingId);

    const formattedDate = new Date(editForm.date).toLocaleDateString("en-US");

    try {
      await updateDoc(dengueDocRef, {
        location: editForm.location,
        cases: Number(editForm.cases),
        deaths: Number(editForm.deaths),
        date: formattedDate,
        regions: editForm.regions,
        year: Number(editForm.year),
      });

      setDengueData(dengueData.map((data) =>
        data.id === editingId ? { id: editingId, ...editForm, date: formattedDate } : data
      ));
      setEditingId(null);
      setIsModalOpen(false);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);  
  };

  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    startPage = Math.max(1, endPage - maxPagesToShow + 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="data-list-section">
      <h2>Dengue Data Lists</h2>
      <input
        type="text"
        placeholder="Search data..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Cases</th>
            <th>Deaths</th>
            <th>Date</th>
            <th>Regions</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((data) => (
            <tr key={data.id}>
              <td>{data.location}</td>
              <td>{data.cases}</td>
              <td>{data.deaths}</td>
              <td>{data.date}</td>
              <td>{data.regions}</td>
              <td>{data.year}</td>  
              <td>
                <div className="button-container">
                  <button className="data-list-button edit" onClick={() => handleEdit(data)}>Edit</button>
                  <button className="data-list-button delete" onClick={() => handleDelete(data.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">
          Prev
        </button>
        {renderPageNumbers()}
        <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-button">
          Next
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Dengue Data"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Edit Dengue Data</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Location"
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Cases"
            value={editForm.cases}
            onChange={(e) => setEditForm({ ...editForm, cases: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Deaths"
            value={editForm.deaths}
            onChange={(e) => setEditForm({ ...editForm, deaths: e.target.value })}
            required
          />
          <input
            type="date"
            value={editForm.date}
            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Regions"
            value={editForm.regions}
            onChange={(e) => setEditForm({ ...editForm, regions: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Year"
            value={editForm.year}
            onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
            required
          />
          <button type="submit">Update Data</button>
          <button type="button" onClick={closeModal}>Cancel</button>
        </form>
      </Modal>
    </div>
  );
};

export default DengueDataList;
