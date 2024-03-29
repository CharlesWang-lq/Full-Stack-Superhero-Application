require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const router = express.Router();
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const updateRoutes = require("./routes/update");
const listRoutes = require("./routes/list");
const verifyRoutes = require("./routes/verify")
const policyRoutes = require("./routes/policy");

const port = 3000;
const mainDir = path.join(__dirname, '../');
const clientDir = path.join(__dirname, '../client');
app.use(express.static(mainDir));
app.use(express.static(clientDir));
const superheroList = [];

// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/update", updateRoutes);
app.use("/api/list", listRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/policy", policyRoutes);

//read superhero data from file
function readSuperheroesData(filename) {
    try {
      const data = fs.readFileSync(filename, 'utf8');
      console.log(`Reading data from ${filename}`);
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading superhero data:', err);
      return [];
    }
  }
  const superheroes = readSuperheroesData('superhero_info.json');
  const superheroPowers = readSuperheroesData('superhero_powers.json');
  
  app.use('/api/heroes/', router);
  //get all powers for a given superhero id

 

router.get('/details', (req, res) => {
  const heroNames = req.query.heroNames;

  if (!heroNames || !Array.isArray(heroNames) || heroNames.length === 0) {

    return res.status(400).json({ error: 'Invalid or empty heroNames parameter' });
  }

  try {
    const heroesDetails = getHeroesDetails(heroNames);
    res.json({ results: heroesDetails });
  } catch (error) {
    console.error('Error fetching hero details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to get hero details based on names
function getHeroesDetails(heroNames) {
  const heroesDetails = [];

  for (const heroName of heroNames) {
    const hero = superheroes.find((hero) => hero.name === heroName);

    if (hero) {
      const powers = superheroPowers.filter((powers) => powers.hero_names === hero.name);
      heroesDetails.push({ ...hero, Power: getPower(hero.name), Powers: powers });
    }
  }

  return heroesDetails;
}
  
  router.get('/search', (req, res) => {
    const searchParams = req.query;
  
    let heroes = match(searchParams);
  
    // if (sortBy) {
    //   heroes = sortSuperheroes(heroes, sortBy);
    // }
  
    res.send({ results: heroes });
  });
  


// Modified match function to handle soft matching
function match(searchParams) {
  const matchingResults = [];

  for (const hero of superheroes) {
    let isMatch = true;

    for (const [field, value] of Object.entries(searchParams)) {
      const formattedField = field !== 'name' ? field.charAt(0).toUpperCase() + field.slice(1) : field;

      // Check if the search term is provided
      if (value !== undefined && value !== null && value.trim() !== "") {
        // Special handling for 'power'
        if (formattedField === 'Power') {
          const powerValue = capitalizeWords(value);
          const matchingPower = superheroPowers.find(
            (powers) => powers[powerValue] === 'True' && powers.hero_names === hero.name
          );

          if (!matchingPower) {
            isMatch = false;
            break;
          }
        } else if (!softMatch(hero[formattedField], value)) {
          // Check if the hero field soft matches the search term
          isMatch = false;
          break;
        }
      }
    }

    if (isMatch) {
      matchingResults.push({ ...hero, Power: getPower(hero.name) }); // Push the entire hero object
    }
  }

  return matchingResults;
}

// Soft match function
function softMatch(str1, str2) {
  // Case-insensitive match
  const lowerStr1 = str1.toLowerCase();
  const lowerStr2 = str2.toLowerCase();

  // Remove white spaces
  const trimmedStr1 = lowerStr1.replace(/\s/g, "");
  const trimmedStr2 = lowerStr2.replace(/\s/g, "");

  // Check if str1 contains str2 at the beginning
  if (trimmedStr1.indexOf(trimmedStr2) === 0) {
    // Check if more than two characters are provided
    if (trimmedStr2.length > 2) {
      let gap = Math.abs(trimmedStr1.length - trimmedStr2.length);

      // Check if the gap is less than 3
      if (gap <= 2) {
        // Compare two strings to see which one has more letters
        let longerStr = trimmedStr1.length >= trimmedStr2.length ? trimmedStr1 : trimmedStr2;
        let shorterStr = trimmedStr1.length < trimmedStr2.length ? trimmedStr1 : trimmedStr2;

        // Subtract the shorter one from the longer one to see the exact gap
        let diff = longerStr.length - shorterStr.length;

        // Check if the gap is less than 3
        if (diff <= 2) {
          // Check if deleting the last one letter from the longer string results in a match
          let modifiedStr1One = longerStr.substring(0, longerStr.length - 1);
          if (modifiedStr1One.indexOf(shorterStr) === 0) {
            return true;
          }

          // Check if deleting the last two letters from the longer string results in a match
          let modifiedStr1Two = longerStr.substring(0, longerStr.length - 2);
          if (modifiedStr1Two.indexOf(shorterStr) === 0) {
            return true;
          }
        }
      }

      // Check if the gap is 0
      if (gap === 0) {
        // Check if deleting one letter from str1 results in a match
        let modifiedStr2 = trimmedStr2.slice(0, -1);
        if (modifiedStr2.indexOf(trimmedStr1) === 0) {
          return true;
        }

        // Check if deleting two letters from str1 results in a match
        modifiedStr2 = trimmedStr2.slice(0, -2);
        if (modifiedStr2.indexOf(trimmedStr1) === 0) {
          return true;
        }
      }
    }

    return true;
  }

  return false;
}

router.get('/exists', async (req, res) => {
  const { names } = req.query;

  // Check if names parameter is provided
  if (!names || !Array.isArray(names) || names.length === 0) {
    return res.status(400).send("Please provide an array of hero names.");
  }

  const existingHeroes = [];

  // Check if each hero name exists (case-insensitive)
  for (const name of names) {
    const existingHero = superheroes.find((hero) => hero.name.toLowerCase() === name.toLowerCase());
    if (existingHero) {
      existingHeroes.push(existingHero.name);
    }
  }

  res.send({ existingHeroes });
});








  function getPower(heroName) {
    const matchingPower = superheroPowers.find((powers) => powers.hero_names === heroName);
  
    if (!matchingPower) {
      return null; // Return null if no matching power is found
    }
  
    // Filter out powers that are not true and join them with spaces
    const truePowers = Object.entries(matchingPower)
      .filter(([power, value]) => power !== 'hero_names' && value === 'True')
      .map(([power]) => power)
      .join(' ');
  
    return truePowers.length > 0 ? truePowers : null;
  }
  
  
  
  
  function capitalizeWords(inputString) {
    inputString = inputString.toLowerCase();
    return inputString.replace(/\b\w/g, function(match) {
        return match.toUpperCase();
    });
}



  //return all the lists created
//   router.get('/lists', (req, res) => {
//     res.status(200).json(superheroList);
//   });
  
//   router.get('/powers/:id', (req, res) => {
//       const id = req.params.id;
//       // Find the superhero by ID and retrieve their powers
//       const superhero = superheroes.find(hero => hero.id === parseInt(id));
//       if (superhero) {
//         const name = superhero.name;
//         const superpowerList = superheroPowers.find(hero => hero.hero_names === name);
//         let validPowers = [];
//         Object.keys(superpowerList).forEach(key=>{
//           if(superpowerList[key] === "True"){
//             validPowers.push(key);
//           }
//         })
//         res.send(validPowers);
//       } else {
//         res.status(404).json({ message: `Superhero with ID ${id} not found` });
//       }
//     });
  

//    //get all available publisher names
//    router.get('/publishers', (req, res) => {
//     const publishers = [];
//     superheroes.forEach(hero => {
//       if (!publishers.includes(hero.Publisher)&&hero.Publisher!=="") {
//         publishers.push(hero.Publisher);
//       }
//     }
//     )
//     if(publishers){
//       res.send(publishers);
//     }else{
//       res.status(404).json({ message: `No publishers found` });
//     }
//   }
// );
//   //search superheroes by id
//   router.get('/:superheroId', (req, res) => {
//     const id = req.params.superheroId;
//     const superhero = superheroes.find(hero => hero.id === parseInt(id));
//     if (superhero) {
//       res.send(superhero);
//     } else {
//       res.status(404).json({ message: `Superhero with ID ${id} not found` });
//     }
//   });
  
//   //Create a new list to save a list of superheroes with a given list name. Return an error if name exists
//   router.post('/lists/:listName', (req, res) => {
//     const listName = req.params.listName;
//     //check if list already exists
//     const existingList = superheroList.find(list => list.name === listName);
//     if (existingList) {
//       res.status(409).json({ message: `List with name ${listName} already exists` });
//     } else {
//       //create a new listF
//       const newList = { name: listName, superheroesIDs: [] };
//       superheroList.push(newList);
//       res.status(201).json(superheroList);
//     }
//   });
  
//   // Route to save superhero IDs to a superhero list
//   router.put('/lists/:listName/:superhero_id', (req, res) => {
//     const listName = req.params.listName;
//     const superheroId = req.params.superhero_id;
//     // Find the list by name
//     const listIndex = superheroList.findIndex(list => list.name === listName);
//     if (listIndex === -1) {
//       return res.status(404).json({ message: `List with name '${listName}' does not exist` });
//     }
  
//     // add additional the superhero IDs for the list
//     // Check for uniqueness
//     if (superheroList[listIndex].superheroesIDs.includes(parseInt(superheroId))) {
//       return res.status(400).json({ message: `Superhero ID '${superheroId}' already exists in the list` });
//     }
//     //check for null, undefined or not an integer
//     if (superheroId === null || superheroId === undefined || isNaN(superheroId)) {
//       return res.status(400).json({ message: `Superhero ID '${superheroId}' is not valid` });
//     }
//     superheroList[listIndex].superheroesIDs.push(parseInt(superheroId));
//     res.status(200).json({ message: 'Superhero IDs saved to the list successfully' });
//   });
  
//   router.get('/lists/:listName', (req, res) => {
//     const listName = req.params.listName;
//     // Find the list by name
//     const listIndex = superheroList.findIndex(list => list.name === listName);
//     if (listIndex === -1) {
//       return res.status(404)({ message: `List with name '${listName}' does not exist` });
//     }
//     res.status(200).json(superheroList[listIndex].superheroesIDs);
//   });
  
//   router.delete('/lists/:listName', (req, res) => {
//     const listName = req.params.listName;
//     // Find the list by name
//     const listIndex = superheroList.findIndex(list => list.name === listName);
//     if (listIndex === -1) {
//       return res.status(404).json({ message: `List with name '${listName}' does not exist` });
//     }
//     superheroList.splice(listIndex, 1);
//     res.status(200).json({ superheroList, message: `List with name '${listName}' deleted successfully` });
//   });
  
//   //Get a list of names, information and powers of all superheroes saved in a given list.
//   router.get('/lists/:listName/superheroes', (req, res) => {
//     let listName = req.params.listName;
//     const sortBy = req.query.sortBy;
  
//     let list = superheroList.find(list => list.name === listName);
//     if (!list) {
//       return res.status(404).json({ message: `List with name '${listName}' does not exist` });
//     }
  
//     let superheroIds = list.superheroesIDs;
//     let superheroesInTheList = superheroes.filter(hero => superheroIds.includes(hero.id));
//     let superheroResults = superheroesInTheList.map(hero => {
//       let heroPowers = superheroPowers.find(power => power.hero_names === hero.name);
//       const validPowers = heroPowers
//         ? Object.keys(heroPowers).filter(key => heroPowers[key] === "True")
//         : []; //in case if it's undefined
  
//       return { ...hero, power: validPowers };
//     });
  
//     // Apply sorting if sortBy is provided
//     if (sortBy) {
//       superheroResults = sortSuperheroes(superheroResults, sortBy);
//     }
  
//     res.status(200).json(superheroResults);
//   });
  
//   function sortSuperheroes(superheroes, sortBy) {
//     sortBy = sortBy.charAt(0).toUpperCase() + sortBy.slice(1);
//     return superheroes.sort((a, b) => {
//       const valueA = String(a[sortBy]).toLowerCase();
//       const valueB = String(b[sortBy]).toLowerCase();
  
//       if (valueA < valueB) return -1;
//       if (valueA > valueB) return 1;
//       return 0;
//     });
//   }

  // router.get('/getId/:heroName' , (req, res) => {
  //   let heroName = req.params.heroName;
  //   let hero = superheroes.find(hero => hero.name.toLowerCase() === heroName.toLowerCase());
  //   if(!hero){
  //     return res.status(404).json({ message: `Hero with name '${heroName}' does not exist` });
  //   }
  //   res.status(200).json(hero.id);
  // });


app.listen(port, console.log(`Listening on port ${port}...`));