// PolicyPage component
import React, { useState, useEffect } from "react";
import axios from "axios";

let myurl = window.location.hostname;
const port = 3000;
const AUPPolicyPage = () => {
  const [policyContent, setPolicyContent] = useState("");

  useEffect(() => {
    // Fetch the latest security and privacy policy content
    const fetchPolicyContent = async () => {
      try {
        const response = await axios.get(`http://${myurl}:${port}/api/policy/acceptable`);
        setPolicyContent(response.data.content);
      } catch (error) {
        console.error("Error fetching security and privacy policy content:", error);
      }
    };

    fetchPolicyContent();
  }, []);

  return (
    <div>
      <h1>acceptable use policy</h1>
      <p>{policyContent}</p>
    </div>
  );
};

export default AUPPolicyPage;