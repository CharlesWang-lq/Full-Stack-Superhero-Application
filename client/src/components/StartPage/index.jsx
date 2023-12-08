import React, { useState, useEffect } from "react";
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

  // Reusable component for displaying hero details

  const [searchResults, setSearchResults] = useState([]);
  const [expandedResult, setExpandedResult] = useState(null);
  const [publicLists, setPublicLists] = useState([]);
  const [expandedLists, setExpandedLists] = useState([]);
  const [expandedHeroDetails, setExpandedHeroDetails] = useState(null);
  const [heroDetails, setHeroDetails] = useState([]);


  useEffect(() => {
    const fetchPublicLists = async () => {
      try {
        const response = await axios.get(`http://${myurl}:${port}/api/list`);
        setPublicLists(response.data);
      } catch (error) {
        console.error("Error fetching public lists:", error);
      }
    };

    fetchPublicLists();
  }, []);

  const fetchHeroDetails = async (listId) => {
    const list = publicLists.find((list) => list.id === listId);

    if (list) {
      try {
        const response = await axios.get(`http://${myurl}:${port}/api/heroes/details`, {
          params: { heroNames: list.heroes },
        });
        setHeroDetails(response.data);
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching hero details:", error);
      }
    }
  };

  const handleListToggle = async (listId) => {
    setExpandedLists((prevLists) =>
      prevLists.includes(listId) ? prevLists.filter((id) => id !== listId) : [...prevLists, listId]
    );
  };
  
  const handleHeroDetailsToggle = async (index, listId) => {
    // Fetch hero details when expanding the hero details
    if (index !== null && listId !== null) {
      await fetchHeroDetails(listId);
    }

    setExpandedHeroDetails((prevIndex) => (prevIndex === index ? null : index));
  };

  
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

  const handleDDGSearch = (hero) => {
    const ddgSearchQuery = `${hero.name} ${hero.Publisher}`;
    window.open(`https://duckduckgo.com/?q=${encodeURIComponent(ddgSearchQuery)}`, "_blank");
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

          {/* Search on DDG button */}
          <button onClick={() => handleDDGSearch(hero)}>Search on DDG</button>
        </div>
      ))}

     
          {/* Display public lists */}
          <div className={styles.publicListsContainer}>
                {publicLists.map((list, index) => (
                  <div key={list.id} className={styles.listCard}>
                    <p>List Name: {list.name}</p>
                    <p>Creator: {list.creator.nickname}</p>
                    <p>Number of Heroes: {list.heroes.length}</p>

                    {/* Expand button/icon */}
                    <button onClick={() => handleListToggle(list.id)}>
                      {expandedLists.includes(list.id) ? "Collapse" : "Expand"}
                    </button>

                    {/* Additional information displayed when expanded */}
                    {expandedLists.includes(list.id) && (
                      <>
                        <p>Description: {list.description}</p>
                        <p>List of Heroes: {list.heroes.join(", ")}</p>
                        <p>Reviews:</p>
                      {list.reviews.map((review, index) => (
                        // Check if review.isVisible is true before rendering
                        review.isVisible && (
                          <div key={index}>
                            <p>User: {review.userName}</p>
                            <p>Average Rating: {list.averageRating}</p>
                            <p>Rating: {review.rating}</p>
                            <p>Comment: {review.comments}</p>
                            <p>Created At: {review.createdAt}</p>
                          </div>
                        )
                      ))}


                    {/* Button to toggle hero details */}
                    <button onClick={() => handleHeroDetailsToggle(index, list.id)}>
                      {expandedHeroDetails === index ? "Collapse Hero Details" : "Expand Hero Details"}
                    </button>

                    {/* Display hero details when expanded */}
                    {expandedHeroDetails === index && (
                        <div>
                          {heroDetails.results.length > 0 ? (
                            heroDetails.results.map((heroDetail, detailIndex) => (
                              <div key={heroDetail.name || detailIndex} className={styles.heroDetails}>
                                <p>Name: {heroDetail.name}</p>
                                <p>Publisher: {heroDetail.Publisher}</p>
                                {/* Add more details as needed */}
                              </div>
                            ))
                          ) : (
                            console.log(heroDetails.length),
                            console.log(heroDetails),
                            <p>Loading hero details...</p>
                          )}
                        </div>
                      )}

                      </>
                    )}
                  </div>
                ))}
              </div>




      <Link to="/login">
        <button type="button" className={styles["login-button"]}>
          Login
        </button>
      </Link>
      <Link to="/policy">Privacy and Security Policy</Link>
      <br />
      <Link to="/dmca">DMCA Policy</Link>
      <br />
      <Link to = "/aup">acceptable use policy </Link>
    </div>
    
  );
};

export default CombinedStartPageAndSearch;
