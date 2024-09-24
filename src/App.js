import React, { useState } from "react";
import AddDengueData from "./AddDengueData";
import DengueDataList from "./DengueDataList";
import CsvUpload from "./CsvUpload";
import ChartsComponent from "./ChartsComponent";
import './App.css';
import logo from './logo.svg';

function App() {
  const [activeTab, setActiveTab] = useState('dataManagement');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="App Logo" className="logo" />
          <h1>Dengue Data CRUD App</h1>
        </div>
        <div className="header-tabs">
          <span
            className={`tab ${activeTab === 'dataManagement' ? 'active' : ''}`}
            onClick={() => handleTabChange('dataManagement')}
          >
            Data Management
          </span>
          <span
            className={`tab ${activeTab === 'dataVisualization' ? 'active' : ''}`}
            onClick={() => handleTabChange('dataVisualization')}
          >
            Data Visualization
          </span>
        </div>
      </header>

      {/* Conditionally render content based on the active tab */}
      {activeTab === 'dataManagement' && (
        <section className="upload-section">
          <AddDengueData />
          <CsvUpload />
          <DengueDataList />
        </section>
      )}

      {activeTab === 'dataVisualization' && (
        <section className="charts-section">
          <ChartsComponent />
        </section>
      )}
    </div>
  );
}

export default App;
