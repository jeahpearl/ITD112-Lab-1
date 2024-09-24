import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore"; 
import { db } from "./firebase"; 

const AddDengueData = ({ onDataAdded }) => {  // Add `onDataAdded` prop
  const [formData, setFormData] = useState({
    location: "",
    cases: "",
    deaths: "",
    date: "",
    regions: "",
    year: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dengueCollection = collection(db, "dengueData");
      await addDoc(dengueCollection, {
        location: formData.location,
        cases: Number(formData.cases),
        deaths: Number(formData.deaths),
        date: new Date(formData.date).toLocaleDateString("en-US"),
        regions: formData.regions,
        year: Number(formData.year),
      });

      alert("Data added successfully!");
      setFormData({
        location: "",
        cases: "",
        deaths: "",
        date: "",
        regions: "",
        year: "",
      });

      onDataAdded();  // Trigger the callback to refresh data after adding
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="add-data-form">
      <h2>Add Dengue Data</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="cases"
          placeholder="Cases"
          value={formData.cases}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="deaths"
          placeholder="Deaths"
          value={formData.deaths}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="date"
          placeholder="Date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="regions"
          placeholder="Regions"
          value={formData.regions}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="year"
          placeholder="Year"
          value={formData.year}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Add Data</button>
      </form>
    </div>
  );
};

export default AddDengueData;
