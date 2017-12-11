/* country consolidated data service -- monolith style */

// include libraries
const _ = require('lodash');                 // basic functions
const express = require('express')           // web server
const bodyParser = require("body-parser");   // add-on to express, to make it able to parse post request bodies
const request = require('request')           // allows to perform HTTP requests
const Promise = require("bluebird")          // Promise implementation

const auth = require('./authentication')       // our (tiny) authentication library

// library initialization
const app = express()
// these two lines are to make express able to parse a json body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/* country consolidated data - http services */

// country data
app.get('/countries/:countryId/consolidatedData',function(request,response) {
  const countryId = request.params.countryId        // query parameter
  const authToken = request.get("Authorization")    // request header

  auth.verifyToken(authToken)
    .then(function(plainToken) {
      try {
        // obtain data 
        let countryData = countryMainData(countryId)
        let populationData = currentPopulationData(countryId)
        let mainCitiesData = mainCities(countryId) 
        // assemble data and give response
        countryData.population = populationData
        countryData.mainCities = mainCitiesData
        response.status(200)
        response.json( countryData )
      } catch (e) {
        response.status(400)    // bad request
        response.json( {"error": e.message} )
      }
    })
    .catch(function(err) {
      response.status(401)    // unauthorized
      response.json( { error: 'Invalid token'} )
    })

})

// token generation
app.post('/token',function(request,response) {
  const theUserName = request.body.userName
  auth.generateToken(theUserName)
    .then(function(theToken) {
      response.status(200)
      response.json( { token: theToken } )
    })
    .catch(function(err) {
      response.status(500)    // internal server error
      response.json( { error: err} )
    })
})


/* make app ready to accept requests */
app.listen(8081, null, null, () => console.log('country information service ready'))


/*
 business functions
*/

function countryMainData(countryId) {
  let theData = null
  if (countryId == 1) {
    theData = { name: 'Argentina', continent: 'America', capitalCityId: 1001 }
  } else if (countryId == 2) {
    theData = { name: 'Brazil', continent: 'America', capitalCityId: 2001 }
  } else if (countryId == 3) {
    theData = { name: 'Thailand', continent: 'Asia', capitalCityId: 3001 }
  } else {
    throw new Error("There is no country having id " + countryId)
  }
  let capitalData = cityData(theData.capitalCityId)
  theData.capitalCityName = capitalData.name
  theData.countryId = countryId
  return theData
}

function currentPopulationData(countryId) {
  let theData = null
  if (countryId == 1) {
    theData = { total: 44272125, males: 21668578, females: 22603547 }
  } else if (countryId == 2) {
    theData = { total: 211243220, males: 103802340, females: 107440880 }
  } else if (countryId == 3) {
     theData = { total: 68292388, males: 33628208, females: 34664180 }
  } else {
    throw new Error("There is no country having id " + countryId)
  }
  theData.countryId = countryId
  return theData
}

function mainCities(countryId) {
  let theCities = null
  if (countryId == 1) {
    theCities = [1001, 1002, 1003]
  } else if (countryId == 2) {
    theCities = [2001, 2002, 2003]
  } else if (countryId == 3) {
    theCities = [3001, 3002]
  } else {
    throw new Error("There is no country having id " + countryId)
  }
  return theCities.map((cityId) => cityData(cityId))
}

function cityData(cityId) {
  let theData = null
  if (cityId == 1001) {
    theData = { name: 'Buenos Aires', latLng: latLng(-34.6,-58.38), population: 13588171 }
  } else if (cityId == 1002) {
    theData = { name: 'Cordoba', latLng: latLng(-31.42,-64.18), population:  1535868 }
  } else if (cityId == 1003) {
    theData = { name: 'Rosario', latLng: latLng(-32.95,-60.65), population:  1690816 }
  } else if (cityId == 2001) {
    theData = { name: 'Brasilia', latLng: latLng(-15.79,-47.88), population:  2977216 }
  } else if (cityId == 2002) {
    theData = { name: 'Rio de Janeiro', latLng: latLng(-22.91,-43.2), population: 12090607 }
  } else if (cityId == 2003) {
    theData = { name: 'Sao Paulo', latLng: latLng(-23.5, -46.62), population: 21091791 }
  } else if (cityId == 3001) {
    theData = { name: 'Bangkok', latLng: latLng(13.75, 100.52), population: 11971000 }
  } else if (cityId == 3002) {
    theData = { name: 'Chiang Mai', latLng: latLng(18.79, 98.98), population: 700000 }
  } else {
    throw new Error("There is no city having id " + countryId)
  }
  theData.cityId = cityId
  return theData
}

function latLng(lat,lng) { return { lat: lat, lng: lng} }

  






