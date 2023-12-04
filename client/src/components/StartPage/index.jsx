import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./styles.module.css";
const port = 3000;
let myurl = window.location.hostname;

const CombinedStartPageAndSearch = () => {
  const [searchData, setSearchData] = useState({
    name: "",
    race: "",
    power: "",
    publisher: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [expandedResult, setExpandedResult] = useState(null);


  
  const handleSearch = async () => {
    try {
      // Convert searchData object into an array of search terms
      const searchFields = Object.entries(searchData)
        .filter(([key, value]) => value !== "")
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
      const url = `http://${myurl}:${port}/api/heroes/search?${searchFields}`;
      const response = await axios.get(url);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error("Error searching heroes:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Superhero Search</h2>
      <p>About: This site offers a platform to search and explore information about heroes.</p>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Hero Name"
          value={searchData.name}
          onChange={(e) => setSearchData({ ...searchData, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Race"
          value={searchData.race}
          onChange={(e) => setSearchData({ ...searchData, race: e.target.value })}
        />
        <input
          type="text"
          placeholder="Power"
          value={searchData.power}
          onChange={(e) => setSearchData({ ...searchData, power: e.target.value })}
        />
        <input
          type="text"
          placeholder="Publisher"
          value={searchData.publisher}
          onChange={(e) => setSearchData({ ...searchData, publisher: e.target.value })}
        />

        <button onClick={handleSearch} className={styles.button}>
          Search
        </button>
      </div>

      {searchResults.map((hero, index) => (
        <div key={hero.id || index} className={styles.heroCard}>
          <p>Name: {hero.name}</p>
          <p>Publisher: {hero.Publisher}</p>

          {/* Additional information */}
          {expandedResult === index && (
            <>
              <p>Gender: {hero.Gender}</p>
              <p>Eye color: {hero["Eye color"]}</p>
              <p>Race: {hero.Race}</p>
              <p>Hair color: {hero["Hair color"]}</p>
              <p>Height: {hero.Height}</p>
              <p>Weight: {hero.Weight}</p>
              <p>Alignment: {hero.Alignment}</p>
              <p>Skin Color: {hero["Skin color"]} </p>
              <p>Power: {hero.Power}</p>
            </>
          )}

          {/* Toggle button */}
          <button onClick={() => setExpandedResult((prevIndex) => (prevIndex === index ? null : index))}>
            {expandedResult === index ? "Collapse" : "Expand"}
          </button>
        </div>
      ))}



      <Link to="/login">
        <button type="button" className={styles["login-button"]}>
          Login
        </button>
      </Link>
    </div>
  );
};

export default CombinedStartPageAndSearch;
