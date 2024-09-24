import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";  // To use Firebase
import { db } from "./firebase";  // Your Firebase setup

const CsvUpload = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("Please upload a valid CSV file.");
      return;
    }
    Papa.parse(file, {
      complete: (result) => {
        setCsvData(result.data);
        setError(null);
      },
      header: true,  // Use headers from the first row of CSV
      skipEmptyLines: true,
    });
  };

  const saveToDatabase = async () => {
    setLoading(true);
    try {
      const dengueCollection = collection(db, "dengueData");  // Assuming 'dengueData' is your collection name
      for (const row of csvData) {
        // Make sure all the column names from the CSV are correctly mapped
        const { loc, cases, deaths, date, Region, year } = row;
        
        await addDoc(dengueCollection, {
          location: loc,
          cases: Number(cases),
          deaths: Number(deaths),
          date: new Date(date).toLocaleDateString("en-US"),  // Convert date to mm/dd/yyyy format
          regions: Region,
          year: Number(year)
        });
      }
      alert("Data saved successfully!");
    } catch (err) {
      console.error("Error saving data: ", err);
      setError("Error saving data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload CSV File</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current.click()} className="custom-file-upload">
        Choose File
      </button>
      {csvData.length > 0 && (
        <button onClick={saveToDatabase} disabled={loading}>
          {loading ? "Saving Data..." : "Save to Database"}
        </button>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CsvUpload;
