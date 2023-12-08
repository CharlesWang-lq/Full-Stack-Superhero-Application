import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import axios from "axios";

const token = localStorage.getItem("token");

let myurl = window.location.hostname;
const port = 3000;

const Navbar = () => {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [listVisibility, setListVisibility] = useState("private");
  const [heroes, setHeroes] = useState([]);
  const [heroName, setHeroName] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [fullListInfo, setFullListInfo] = useState(null);
  const [expandedListId, setExpandedListId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editListId, setEditListId] = useState(null);
  const [reviewListId, setReviewListId] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  


  useEffect(() => {
    const fetchUserLists = async () => {
      try {
        // Retrieve user email
        const userResponse = await axios.get(`http://${myurl}:${port}/api/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = userResponse.data;
        const userEmail = userData.email;
        console.log(userEmail);

        // Fetch all public and user's private lists
        const listsResponse = await axios.get(`http://${myurl}:${port}/api/list/authed`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            userEmail: userEmail,
          },
        });

        const allLists = listsResponse.data;
        setLists(allLists);
      } catch (error) {
        console.error("Error fetching user lists:", error);
      }
    };

    fetchUserLists();
  }, []);

  const handleCreateList = async () => {
    // Validate required attributes
    if (!listName || !heroName) {
      alert("List Name and at least one hero are required.");
      return;
    }

      // Check if the user has reached the maximum limit of 20 lists
      if (lists.length >= 20) {
        alert("You can only create up to 20 lists.");
        return;
      }

    // Check if all heroes exist
    const enteredHeroes = heroName.split(',').map(hero => hero.trim());

    try {
      const response = await axios.get(`http://${myurl}:${port}/api/heroes/exists`, {
        params: {
          names: enteredHeroes,
        },
      });

      const data = response.data;
      const invalidHeroes = enteredHeroes.filter(hero =>
        !data.existingHeroes.map(existingHero => existingHero.toLowerCase()).includes(hero.toLowerCase())
      );
      if (invalidHeroes.length > 0) {
        alert(`The following heroes do not exist: ${invalidHeroes.join(", ")}`);
        return;
      }

      // Fetch user information from your backend (assuming you have user authentication in place)
      try {
        const userResponse = await axios.get(`http://${myurl}:${port}/api/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = userResponse.data;

        // Create a new list object with user information
        const newList = {
          name: listName,
          description: listDescription,
          visibility: listVisibility,
          heroes: enteredHeroes,
          creator: {
            nickname: userData.nickname,
            email: userData.email,
          },
        };

        // Save the new list to your backend
        try {
          const createListResponse = await axios.post(`http://${myurl}:${port}/api/list`, newList);
          const createdList = createListResponse.data;
          setLists([...lists, createdList]);
        } catch (error) {
          console.error("Error creating list:", error);
          alert("Error creating list. Please try again.");
        }

      } catch (error) {
        console.error("Error fetching user information:", error);
        alert("Error fetching user information. Please try again.");
      }

      // Clear the input fields
      setListName("");
      setListDescription("");
      setListVisibility("private");
      setHeroName("");
    } catch (error) {
      console.error("Error fetching hero data:", error);
      // Handle the error appropriately, e.g., show an alert to the user
      alert("Error fetching hero data. Please try again.");
    }
  };

  const handleReviewButtonClick = (listId) => {
    setReviewListId(listId);
    setShowReviewForm(true);
  };

  const handleReviewSubmit = async (showForm, listId) => {
    const confirmation = window.confirm("Are you sure you want to save?");
    if (confirmation) {
      try {
          // Fetch user information from your backend (assuming you have user authentication in place)
        const userResponse = await axios.get(`http://${myurl}:${port}/api/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
      },
    });

    const userData = userResponse.data;

    const response = await axios.post(`http://${myurl}:${port}/api/list/reviews`, {
      listId: reviewListId,
      userName: userData.nickname, // Use the actual user name retrieved from the backend
      rating: reviewRating,
      comment: `${reviewComment} - ${new Date().toLocaleString()} by ${userData.nickname}`,
    });


        // Handle success
        console.log(response.data);

        // Clear review form fields and hide the form
        setReviewListId(null);
        setReviewRating(0);
        setReviewComment('');
        setShowReviewForm(false);

        // Show a confirmation message
        alert('Review saved successfully!');
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Error submitting review. Please try again.');
      }
    }
  };

  const handleExpand = (listId) => {
    // Toggle the expanded state for the clicked list
    setExpandedListId((prevId) => (prevId === listId ? null : listId));
  };

  const handleEdit = (listId) => {
    // Set the listId in edit mode
    setEditListId(listId);
    setEditMode(true);

    // Fetch the list details and populate the input fields for editing
    const listToEdit = lists.find((list) => list._id === listId);
    if (listToEdit) {
      setListName(listToEdit.name);
      setListDescription(listToEdit.description);
      setListVisibility(listToEdit.private ? "private" : "public");
      setHeroName(listToEdit.heroes.join(", "));
    }
  };

  const handleSaveEdit = async () => {
    // Validate required attributes
    if (!listName || !heroName) {
      alert("List Name and at least one hero are required.");
      return;
    }

    // Check if all heroes exist
    const enteredHeroes = heroName.split(',').map(hero => hero.trim());

    try {
      const response = await axios.get(`http://${myurl}:${port}/api/heroes/exists`, {
        params: {
          names: enteredHeroes,
        },
      });

      const data = response.data;
      const invalidHeroes = enteredHeroes.filter(hero =>
        !data.existingHeroes.map(existingHero => existingHero.toLowerCase()).includes(hero.toLowerCase())
      );
      if (invalidHeroes.length > 0) {
        alert(`The following heroes do not exist: ${invalidHeroes.join(", ")}`);
        return;
      }

      // Fetch user information from your backend (assuming you have user authentication in place)
      try {
        const userResponse = await axios.get(`http://${myurl}:${port}/api/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = userResponse.data;

        // Create a new list object with user information
        const updatedList = {
          name: listName,
          description: listDescription,
          visibility: listVisibility,
          heroes: enteredHeroes,
          creator: {
            nickname: userData.nickname,
            email: userData.email,
          },
        };

        // Save the updated list to your backend
        try {
          const updateListResponse = await axios.put(`http://${myurl}:${port}/api/list/${editListId}`, updatedList);
          const updatedListData = updateListResponse.data;

          // Update the lists state with the updated list
          setLists((prevLists) => prevLists.map((list) => (list._id === editListId ? updatedListData : list)));
        } catch (error) {
          console.error("Error updating list:", error);
          alert("Error updating list. Please try again.");
        }

      } catch (error) {
        console.error("Error fetching user information:", error);
        alert("Error fetching user information. Please try again.");
      }

      // Clear the input fields and exit edit mode
      setListName("");
      setListDescription("");
      setListVisibility("private");
      setHeroName("");
      setEditMode(false);
      setEditListId(null);
    } catch (error) {
      console.error("Error fetching hero data:", error);
      // Handle the error appropriately, e.g., show an alert to the user
      alert("Error fetching hero data. Please try again.");
    }
  };

  const handleDelete = async (listId) => {
    const confirmation = window.confirm("Are you sure you want to delete this list?");
    if (confirmation) {
      try {
        await axios.delete(`http://${myurl}:${port}/api/list/${listId}`);

        // Remove the deleted list from the state
        setLists((prevLists) => prevLists.filter((list) => list._id !== listId));
      } catch (error) {
        console.error("Error deleting list:", error);
        alert("Error deleting list. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div>
      <nav className={styles.navbar}>
        <h1>Heroes List App</h1>
        <Link to="/update-password" className={styles.white_btn}>
          Update Password
        </Link>

        {/* Logout Section */}
        <button className={styles.white_btn} onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* Create List Section */}
      <div className={styles.createListContainer}>
        <input
          type="text"
          placeholder="List Name"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />
        <textarea
          placeholder="List Description"
          value={listDescription}
          onChange={(e) => setListDescription(e.target.value)}
        />
        <label>
          Visibility:
          <select
            value={listVisibility}
            onChange={(e) => setListVisibility(e.target.value)}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>

        {/* Input field for hero names */}
        <div>
          <h3>Enter Hero Names (comma-separated):</h3>
          <input
            type="text"
            placeholder="e.g., Spider-Man, Iron Man, Captain America"
            value={heroName}
            onChange={(e) => setHeroName(e.target.value)}
          />
        </div>

        <button onClick={editMode ? handleSaveEdit : handleCreateList}>
          {editMode ? "Save Changes" : "Create List"}
        </button>
      </div>

      {/* Display Lists Section */}
      <div className={styles.displayListsContainer}>
        <h2>Your Lists:</h2>
        {lists.map((list, index) => (
          <div key={index} className={styles.listItem}>
            {/* Display only the list name initially */}
            <h3>List Name: {list.name}</h3>

            {/* Show additional details if the list is expanded */}
            {expandedListId === list._id && (
              <div>
                <p>List Description: {list.description}</p>
                <p>Visibility: {list.private ? "private" : "public"}</p>
                <p>Heroes: {list.heroes.join(", ")}</p>
                <p>Creator: {list.creator.nickname}</p>
                <p>Last Modified Date:{list.lastModified}</p>
                <div>
                <p>Reviews:</p>
                {list.reviews.map((review, index) => (
                  review.isVisible  && (
                  <div key={index}>
                    <p>User: {review.userName}</p>
                    <p>Average Rating: {list.averageRating}</p>
                    <p>Rating: {review.rating}</p>
                    <p>Comment: {review.comments}</p>
                    <p>Created At: {review.createdAt}</p>
                  </div>
                )))}
              </div>
            </div>
            )}

            {/* Add an "Expand" button for each list */}
            <button onClick={() => handleExpand(list._id)}>
              {expandedListId === list._id ? "Collapse" : "Expand"}
            </button>

            {/* Add an "Edit" button for each list */}
            <button onClick={() => handleEdit(list._id)}>Edit</button>

             {/* Add a "Delete" button for each list */}
             <button onClick={() => handleDelete(list._id)}>Delete</button>

             {/* Add a "Review" button for each list */}
            <button onClick={() => handleReviewButtonClick(list._id)}>Review</button>

            {/* Review Form */}
            {showReviewForm && reviewListId === list._id && (
              <div className={styles.reviewForm}>
                <label>
                  Rating:
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                  />
                </label>
                <textarea
                  placeholder="Enter your comment..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <button onClick={handleReviewSubmit}>Save Review</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
