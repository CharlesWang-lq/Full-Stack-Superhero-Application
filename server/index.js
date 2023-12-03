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
  
  app.use('/api/superheroes/', router);
  //get all powers for a given superhero id
  
  //return all the lists created
  router.get('/lists', (req, res) => {
    res.status(200).json(superheroList);
  });
  
  router.get('/powers/:id', (req, res) => {
      const id = req.params.id;
      // Find the superhero by ID and retrieve their powers
      const superhero = superheroes.find(hero => hero.id === parseInt(id));
      if (superhero) {
        const name = superhero.name;
        const superpowerList = superheroPowers.find(hero => hero.hero_names === name);
        let validPowers = [];
        Object.keys(superpowerList).forEach(key=>{
          if(superpowerList[key] === "True"){
            validPowers.push(key);
          }
        })
        res.send(validPowers);
      } else {
        res.status(404).json({ message: `Superhero with ID ${id} not found` });
      }
    });
  
    //get all available publisher names
  router.get('/publishers', (req, res) => {
      const publishers = [];
      superheroes.forEach(hero => {
        if (!publishers.includes(hero.Publisher)&&hero.Publisher!=="") {
          publishers.push(hero.Publisher);
        }
      }
      )
      if(publishers){
        res.send(publishers);
      }else{
        res.status(404).json({ message: `No publishers found` });
      }
    }
  );
  
  router.get('/search/:searchBy/:searchField/:number', (req, res) => {
    const sortBy = req.query.sortBy;
    let heroes = match(req.params.searchBy, req.params.searchField, req.params.number);
    if(sortBy){
      heroes = sortSuperheroes(heroes, sortBy);
    }
    res.send(heroes)
  })
  function sortSuperheroes(superheroes, sortBy) {
    sortBy = sortBy.charAt(0).toUpperCase() + sortBy.slice(1);
    return superheroes.sort((a, b) => {
      const valueA = String(a[sortBy]).toLowerCase();
      const valueB = String(b[sortBy]).toLowerCase();
  
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });
  }
  
  //create a match function
  function match(pattern, field, number){
    let matchingResults = [];
    let searchField = field.toLowerCase();
  
  
    if(pattern == "Power"){
      let formattedField = searchField.replace(/\b\w/g, (char) => char.toUpperCase());
      for(powers of superheroPowers)  {
        if(powers[formattedField] == "True"){
          let hero = superheroes.find(hero => hero.name === powers.hero_names);
          if(hero){
            matchingResults.push(hero);
          }
        }
      }
    }
  
    if(pattern == "Name"){
      for(hero of superheroes){
        if(hero["name"].toLowerCase().includes(searchField))
          matchingResults.push(hero);
      }
    }
  
    if(pattern == "Publisher"){
      for(hero of superheroes){
        if(hero["Publisher"].toLowerCase().includes(searchField))
          matchingResults.push(hero);
      }
    }
  
    if(pattern == "Race"){
      for(hero of superheroes){
        if(hero["Race"].toLowerCase().includes(searchField))
          matchingResults.push(hero);
      }
    }
    return matchingResults.slice(0, number);
  
  }
  
  //search superheroes by id
  router.get('/:superheroId', (req, res) => {
    const id = req.params.superheroId;
    const superhero = superheroes.find(hero => hero.id === parseInt(id));
    if (superhero) {
      res.send(superhero);
    } else {
      res.status(404).json({ message: `Superhero with ID ${id} not found` });
    }
  });
  
  //Create a new list to save a list of superheroes with a given list name. Return an error if name exists
  router.post('/lists/:listName', (req, res) => {
    const listName = req.params.listName;
    //check if list already exists
    const existingList = superheroList.find(list => list.name === listName);
    if (existingList) {
      res.status(409).json({ message: `List with name ${listName} already exists` });
    } else {
      //create a new listF
      const newList = { name: listName, superheroesIDs: [] };
      superheroList.push(newList);
      res.status(201).json(superheroList);
    }
  });
  
  // Route to save superhero IDs to a superhero list
  router.put('/lists/:listName/:superhero_id', (req, res) => {
    const listName = req.params.listName;
    const superheroId = req.params.superhero_id;
    // Find the list by name
    const listIndex = superheroList.findIndex(list => list.name === listName);
    if (listIndex === -1) {
      return res.status(404).json({ message: `List with name '${listName}' does not exist` });
    }
  
    // add additional the superhero IDs for the list
    // Check for uniqueness
    if (superheroList[listIndex].superheroesIDs.includes(parseInt(superheroId))) {
      return res.status(400).json({ message: `Superhero ID '${superheroId}' already exists in the list` });
    }
    //check for null, undefined or not an integer
    if (superheroId === null || superheroId === undefined || isNaN(superheroId)) {
      return res.status(400).json({ message: `Superhero ID '${superheroId}' is not valid` });
    }
    superheroList[listIndex].superheroesIDs.push(parseInt(superheroId));
    res.status(200).json({ message: 'Superhero IDs saved to the list successfully' });
  });
  
  router.get('/lists/:listName', (req, res) => {
    const listName = req.params.listName;
    // Find the list by name
    const listIndex = superheroList.findIndex(list => list.name === listName);
    if (listIndex === -1) {
      return res.status(404)({ message: `List with name '${listName}' does not exist` });
    }
    res.status(200).json(superheroList[listIndex].superheroesIDs);
  });
  
  router.delete('/lists/:listName', (req, res) => {
    const listName = req.params.listName;
    // Find the list by name
    const listIndex = superheroList.findIndex(list => list.name === listName);
    if (listIndex === -1) {
      return res.status(404).json({ message: `List with name '${listName}' does not exist` });
    }
    superheroList.splice(listIndex, 1);
    res.status(200).json({ superheroList, message: `List with name '${listName}' deleted successfully` });
  });
  
  //Get a list of names, information and powers of all superheroes saved in a given list.
  router.get('/lists/:listName/superheroes', (req, res) => {
    let listName = req.params.listName;
    const sortBy = req.query.sortBy;
  
    let list = superheroList.find(list => list.name === listName);
    if (!list) {
      return res.status(404).json({ message: `List with name '${listName}' does not exist` });
    }
  
    let superheroIds = list.superheroesIDs;
    let superheroesInTheList = superheroes.filter(hero => superheroIds.includes(hero.id));
    let superheroResults = superheroesInTheList.map(hero => {
      let heroPowers = superheroPowers.find(power => power.hero_names === hero.name);
      const validPowers = heroPowers
        ? Object.keys(heroPowers).filter(key => heroPowers[key] === "True")
        : []; //in case if it's undefined
  
      return { ...hero, power: validPowers };
    });
  
    // Apply sorting if sortBy is provided
    if (sortBy) {
      superheroResults = sortSuperheroes(superheroResults, sortBy);
    }
  
    res.status(200).json(superheroResults);
  });
  
  router.get('/getId/:heroName' , (req, res) => {
    let heroName = req.params.heroName;
    let hero = superheroes.find(hero => hero.name.toLowerCase() === heroName.toLowerCase());
    if(!hero){
      return res.status(404).json({ message: `Hero with name '${heroName}' does not exist` });
    }
    res.status(200).json(hero.id);
  });


app.listen(port, console.log(`Listening on port ${port}...`));