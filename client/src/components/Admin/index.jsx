import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.module.css";
import { Link } from "react-router-dom";


const Admin = () => {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [allLists, setAllLists] = useState([]);
  const [policyContent, setPolicyContent] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState("security"); // Default to "security"
  const [message, setMessage] = useState("");

  let myurl = window.location.hostname;
  const port = 3000;

  useEffect(() => {
    // Fetch reviews, users, and policy content when the component mounts
    fetchUsers();
    fetchAllLists();
    fetchPolicyContent();
  }, []);

  const fetchAllLists = async () => {
    try {
      const response = await axios.get(`http://${myurl}:${port}/api/list/all-lists`);
      setAllLists(response.data);
    } catch (error) {
      console.error("Error fetching all lists:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://${myurl}:${port}/api/users/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPolicyContent = async () => {
    try {
      const response = await axios.get(`http://${myurl}:${port}/api/policies/policy?type=${selectedPolicy}`);
      setPolicyContent(response.data.content || "");
    } catch (error) {
      console.error("Error fetching policy content:", error);
    }
  };

  const handleGrantAdminPrivilege = async (userId) => {
    try {
      await axios.post(`http://${myurl}:${port}/api/users/grantadmin/${userId}`);
      // Refresh the user list after granting admin privilege
      fetchUsers();
    } catch (error) {
      console.error("Error granting admin privilege:", error);
    }
  };

  const handleToggleVisibility = async (listId, reviewId, isVisible) => {
    try {
      // Toggle the visibility on the backend
      await axios.put(`http://${myurl}:${port}/api/list/toggle-visibility/${listId}/${reviewId}`, {});
      
      // Update the local state to reflect the change
      setAllLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId
            ? {
                ...list,
                reviews: list.reviews.map((review) =>
                  review._id === reviewId ? { ...review, isVisible: !isVisible } : review
                ),
              }
            : list
        )
      );
    } catch (error) {
      console.error('Error toggling review visibility:', error);
    }
  };

  const handleToggleDeactivate = async (userId) => {
    try {
      await axios.put(`http://${myurl}:${port}/api/users/deactivate/${userId}`);
      // Refresh the user list after toggling deactivation
      fetchUsers();
    } catch (error) {
      console.error("Error toggling deactivation:", error);
    }
  };

  const handleCreateOrUpdatePolicy = async () => {
    try {
      await axios.put(`http://${myurl}:${port}/api/policy`, {
        type: selectedPolicy,
        content: policyContent,
      });
      // Fetch the latest policy after creating or updating
      fetchPolicyContent();
      setMessage(`${selectedPolicy} policy updated successfully!`);
    } catch (error) {
      console.error(`Error updating ${selectedPolicy} policy:`, error);
      setMessage(`Failed to update ${selectedPolicy} policy. Please try again.`);
    }
  };

  return (
    <div>
      <h1>Admin Page</h1>

      

      {/* Dropdown menu for selecting policy type */}
      <label>Select Policy Type: </label>
      <select
        value={selectedPolicy}
        onChange={(e) => setSelectedPolicy(e.target.value)}
      >
        <option value="security">Security and Privacy Policy</option>
        <option value="dmca">DMCA Notice & Takedown Policy</option>
        <option value="acceptable">Acceptable Use Policy</option>
      </select>

      {/* Buttons for creating and updating policies */}
      <button onClick={handleCreateOrUpdatePolicy}>Create Policy</button>
      <button onClick={handleCreateOrUpdatePolicy}>Update Policy</button>

      {/* Input field for creating or updating policy */}
      <div>
        <textarea
          value={policyContent}
          onChange={(e) => setPolicyContent(e.target.value)}
          placeholder={`Enter ${selectedPolicy} policy content...`}
        />
      </div>

      {message && <p style={{ color: message.includes("successfully") ? "green" : "red" }}>{message}</p>}

      <br/>

      <Link to="/document">workflow and usage of tools</Link>
      <br/>

              {/* DMCA Tools */}
      <h2>DMCA Tools</h2>
      <label>Select Review:</label>
      <input type="text" onChange={(e) => (e.target.value)} />
      <label>Select DMCA Type:</label>
      <select  onChange={(e) => (e.target.value)}>
        <option value="request">Request</option>
        <option value="notice">Notice</option>
        <option value="dispute">Dispute</option>
      </select>
      <button>Submit</button>

      {/* List of Users */}
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.firstName + " " + user.lastName + " " + user.email}
            {user.isAdmin && <span style={{ marginLeft: '10px', fontWeight: 'bold', color: 'green' }}>Admin</span>}
            {!user.isAdmin && (
              <button onClick={() => handleToggleDeactivate(user._id)}>
                {user.isDeactivated ? "Activate" : "Deactivate"}
              </button>
            )}
            {!user.isAdmin && (
              <button onClick={() => handleGrantAdminPrivilege(user._id)}>
                Grant Admin
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* List of Reviews */}
      <h1>All Reviews</h1>

      {/* Display all lists with their reviews */}
      {allLists.map((list) => (
        <div key={list._id}>
          <h2>List Name: {list.name}</h2>
          <p>List Description: {list.description}</p>
          <p>Visibility: {list.private ? "private" : "public"}</p>

          {/* Display reviews for the current list */}
          <h3>Reviews:</h3>
          {list.reviews.map((review) => (
            <div key={review.createdAt}>
              <p>User: {review.userName}</p>
              <p>Rating: {review.rating}</p>
              <p>Comment: {review.comments}</p>
              <p>Created At: {review.createdAt}</p>
              <p>Visibility: {review.isVisible ? 'visible' : 'hidden'}</p>
              <button onClick={() => handleToggleVisibility(list._id, review._id, review.isVisible)}>
                {review.isVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Admin;
