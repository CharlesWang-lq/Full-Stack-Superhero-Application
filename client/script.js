// Function to sanitize string inputs
function sanitizeInput(input) {
  // Allow only 
  return input.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '');
}

let searchBtn = document.getElementById("searchButton");
let searchInput = document.getElementById("searchInput");
let searchResults = document.getElementById("searchResults");
let searchCriteria = document.getElementById("searchCriteria");
let searchNumber = document.getElementById("integerInput");

let createListBtn = document.getElementById("createListBtn");
let createListInput = document.getElementById("listName");
let customListsSelect = document.getElementById("customLists");
let listResults = document.getElementById("listResults");

let displayListsButton = document.getElementById("displayListButton");
let addSuperheroBtn = document.getElementById("addHeroButton");
let deleteCustomListBtn = document.getElementById("deleteButton");
let addSuperheroName = document.getElementById("nameInput");

let replacementHero = document.getElementById("replaceName");
let replaceBtn = document.getElementById("replaceButton");
let sortCriteriaSelect = document.getElementById("sortCriteria");
let sortBtn = document.getElementById("sortButton");


searchBtn.addEventListener("click", searchSuperheroes);
createListBtn.addEventListener("click", createCustomList);
addSuperheroBtn.addEventListener("click", addSuperHero);
displayListsButton.addEventListener("click", displayListResults);
deleteCustomListBtn.addEventListener("click", deleteCustomList);
replaceBtn.addEventListener("click", replaceHero);

let myurl = window.location.hostname;

async function loadCreatedLists() {
  // Define the path to retrieve the lists (replace with your API endpoint)
  const path = `http://${myurl}:3000/api/superheroes/lists`;

  try {
    const response = await fetch(path, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();

      // Clear the select element before adding new options
      customListsSelect.innerHTML = '';

      data.forEach(function(list) {
        const option = document.createElement('option');
        option.value = list.name; // Use a unique identifier for the list
        option.text = list.name;
        customListsSelect.appendChild(option);
      });
    } else {
      console.error('Error loading the lists:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Call the loadCreatedLists function when the page loads
window.addEventListener('load', loadCreatedLists);

async function createCustomList() {
  const listName = sanitizeInput(createListInput.value);

  if (listName === "") {
    alert("List name cannot be empty. Please enter a list name.");
    return;
  }

  const path = `http://${myurl}:3000/api/superheroes/lists/${listName}`;

  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json ; charset=utf-8'
      }
    });

    if (response.ok) {
      const data = await response.json();

      customListsSelect.innerHTML = '';
      data.forEach(function(list) {
        const option = document.createElement('option');
        option.value = list.name; // Use a unique identifier for the list
        option.text = list.name;
        customListsSelect.appendChild(option);
      });

      // Clear the input field and select
      createListInput.value = '';
    } else {
      console.error('Error creating the list:', response.status, response.statusText);
      const data = await response.json();
      alert(data.message);
      throw new Error('Error creating list duplicate list');
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

async function searchSuperheroes(){
    let searchBy = sanitizeInput(searchCriteria.value);
    let searchInputValue = sanitizeInput(searchInput.value);
    //sanitize the input and make sure it has to be an integer
    let searchNumberValue = parseInt(searchNumber.value);
    if (isNaN(searchNumberValue)) {
      alert("Please enter a valid integer for the search number.");
      return;
    }

    let path = `http://${myurl}:3000`;
   
    searchResults.innerHTML = '';
    if(searchBy == "name"){
        path += `/api/superheroes/search/Name/${searchInputValue}/${searchNumberValue}`;
    }
    else if(searchBy == "publisher"){
        path += `/api/superheroes/search/Publisher/${searchInputValue}/${searchNumberValue}`;
    }
    else if(searchBy == "race"){
        path += `/api/superheroes/search/Race/${searchInputValue}/${searchNumberValue}`;
    }else if(searchBy == "powers"){
        path += `/api/superheroes/search/Power/${searchInputValue}/${searchNumberValue}`;
    }
    let sortBy = sanitizeInput(sortCriteriaSelect.value);
    if (sortBy) {
      path += `?sortBy=${sortBy}`;
    }
    console.log(path);
    try {
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.json();
          let result = document.createElement('li');
          if (data.length === 0) {
            result.appendChild(document.createTextNode('No results found'));
          } else {
            data.forEach(d => {
              // Loop through the properties of the superhero object
              for (let prop in d) {
                if (d.hasOwnProperty(prop)) {
                  result.appendChild(document.createTextNode(`${prop}: ${d[prop]}, `));
                }
              }
              result.appendChild(document.createElement('br'));
            });
          }
          searchResults.appendChild(result);
        } else {
          console.error('Error fetching data:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
}

async function displayListResults(){
  let selectedValue = sanitizeInput(customListsSelect.value);
  listResults.innerHTML = '';
    // Check if it's not null
    if (selectedValue == "") {
      // Do something with the selected value
      alert("Select list is empty");
      return
    }

    let path = `http://${myurl}:3000/api/superheroes/lists/${selectedValue}/superheroes`;
    let sortBy = sanitizeInput(sortCriteriaSelect.value);
    if (sortBy) {
      path += `?sortBy=${sortBy}`;
    }
    try {
      const response = await fetch(path);
      if (response.ok) {
        const data = await response.json();
        let result = document.createElement('li');
        if (data.length === 0) {
          result.appendChild(document.createTextNode('No results found'));
        } else {
          data.forEach(d => {
            // Loop through the properties of the superhero object
            for (let prop in d) {
              if (d.hasOwnProperty(prop)) {
                result.appendChild(document.createTextNode(`${prop}: ${d[prop]}, `));
              }
            }
            result.appendChild(document.createElement('br'));
          });
        }
        listResults.appendChild(result);
      } else {
        console.error('Error fetching data:', response.status, response.statusText);
        if(response.status === 404){
          const data = await response.json();
          alert(data.message);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }


async function addSuperHero(){
  try{
    let selectedValue = sanitizeInput(customListsSelect.value); 
    // Check if it's not null
    if (selectedValue == "") {
      // Do something with the selected value
      alert("Select list is empty");
      return
      }   
    const idPath =  `http://${myurl}:3000/api/superheroes/getId/${sanitizeInput(addSuperheroName.value)}`;
    const idResponse = await fetch(idPath);
    if(!idResponse.ok){
      if(idResponse.status === 404){
        alert("Superhero not found");
        return
    }else{
      throw new Error(`Error fetching superhero ID: ${idResponse.status} ${idResponse.statusText}`);
    }
    }
    const idData = await idResponse.json(); 
    const listPath = `http://${myurl}:3000/api/superheroes/lists/${selectedValue}/${idData}`;
    const listResponse = await fetch(listPath, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json ; charset=utf-8'
      },
      body: JSON.stringify({ listName: customListsSelect.value })
    });
    const listData = await listResponse.json();
    alert(listData.message);
  } catch (error) {
    alert("Error adding superhero to the list");
    console.log(error);
  }
}

async function deleteCustomList(){
  let selectedValue = sanitizeInput(customListsSelect.value);
  // Check if it's not null
  if (selectedValue === "") {
    // Do something with the selected value
    alert("Select list is empty");
    return
  }
  const path = `http://${myurl}:3000/api/superheroes/lists/${selectedValue}`;
  try {
    const response = await fetch(path, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json ; charset=utf-8'
      }
    });
    if (response.ok) {
      const data = await response.json();
      superheroListGot = data.superheroList;
      customListsSelect.innerHTML = '';
      superheroListGot.forEach(function(list) {
        const option = document.createElement('option');
        option.value = list.name; // Use a unique identifier for the list
        option.text = list.name;
        customListsSelect.appendChild(option);
      });
      alert(data.message);
      //update the select element after deleting the list

    } else {
      alert(error('Error deleting the list:', response.status, response.statusText));
    }
  } catch (error) {
    alert('Fetch error:', error);
  }
}
async function replaceHero(){
  const replaceName = sanitizeInput(replacementHero.value);
  const listName = sanitizeInput(customListsSelect.value);
  if(replaceName === ""){
    alert("Please enter a superhero name");
    return;
  }else if(listName === ""){
    alert("Please select a list");
    return;
  }else{

    try{
      const responseDelete = await fetch(`http://${myurl}:3000/api/superheroes/lists/${listName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(!responseDelete.ok){
        if(responseDelete.status === 404){
          alert("List not found");
        }
      }

      const responseCreate = await fetch(`http://${myurl}:3000/api/superheroes/lists/${listName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(!responseCreate.ok){
        if(responseCreate.status === 404){
          alert("List not found");
        }
      }

      const responseID = await fetch(`http://${myurl}:3000/api/superheroes/getId/${replaceName}`);
      const idData = await responseID.json();


      const replacePath = `http://${myurl}:3000/api/superheroes/lists/${listName}/${idData}`;
      const replaceResponse = await fetch(replacePath, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (replaceResponse.ok) {
        displayListResults()
      } else {
        alert(error('Error replacing the list:', replaceResponse.status, replaceResponse.statusText));
      }
      
    }catch (error) {
      alert("Superhero doesn't exist in records!");
      console.log(error);
  }
  }
}

//sort the search or list results
function sortResults(){
  const sortCriteria = sanitizeInput(sortCriteriaSelect.value);
  if(searchResults.textContent !== "" && listResults.textContent !== ""){
    sortSearchResults(sortCriteria, "search");
    sortSearchResults(sortCriteria, "list")
  }else if(searchResults.textContent == "" && listResults.textContent !== ""){
    sortSearchResults(sortCriteria, "list");
  }else if(searchResults.textContent !== "" && listResults.textContent == ""){
    sortSearchResults(sortCriteria, "search");
  } 
}
