const HOST = 'server.com/';

const searchInput = document.getElementsByClassName('search__bar__input')[0];

function onSuggestionsResponse(data) {
  const suggestionsElement = document.getElementsByClassName('search__suggestions__list')[0];
  let suggestionsHTML = "";
  for (const suggestion of data) {
    suggestionsHTML += (suggestion.suggestion + ' - ' + suggestion.auxiliary + '<br>');
  }
  suggestionsElement.innerHTML = suggestionsHTML;
}

function onNewInput(event) {
  api.get(HOST + 'autocomplete', searchInput.value, onSuggestionsResponse);
}

searchInput.oninput = onNewInput;

// Server

function getRandomString({length}) { 
  const characterChoices = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 "; 
  const characters = [];
  while (characters.length < length) {
    const randomIndex = Math.floor(Math.random() * characterChoices.length);
    characters.push(characterChoices[randomIndex]);
  }
  return characters.join('');
}

function getRandomInteger({min, max}) {
  return Math.floor(Math.random() * (max - min) + min);
}

function generateSuggestion(prefix) {
  const RATIO_EXACT_MATCH = 0.3;
  const RATIO_AUTOCORRECT = 0.1;
  
  if (Math.random() < RATIO_AUTOCORRECT) {
    return getRandomString({ length: getRandomInteger({min: 1, max: prefix.length}) })
  }
  
  if (Math.random() < RATIO_EXACT_MATCH) {
    return prefix;
  }

  return prefix + getRandomString({ length: getRandomInteger({min: 1, max: 10}) })
}

function getAutocompleteHandler(data) {
  const MAX_CHARS = 10;
  const NUM_AUTOCOMPLETE_RESULTS = 10;
  const RATIO_AUXILIARY_DATA = 0.1;
  
  if (data.length > MAX_CHARS) {
    return [];
  }
  
  const results = [];
  while (results.length < NUM_AUTOCOMPLETE_RESULTS) {
    const suggestion = generateSuggestion(data)
    if (results.find(result => result.suggestion === suggestion)) {
      continue;
    }
    
    if (Math.random() < RATIO_AUXILIARY_DATA) {
      for (let i = 0; i < 2; i++) {
        results.push({
          suggestion, 
          auxiliary: getRandomString({ length: getRandomInteger({min: 5, max: 15}) }) 
        });
      }
    } else {
      results.push({ suggestion, auxiliary: "" });
    }
  }
  return results;
}

const endpoints = {
  "/": {
    "get": () => "hello world"
  },
  "/autocomplete": {
    "get": getAutocompleteHandler
  }
}

// API library

function getFunction(url, data, callback) {
  const domain = url.substring(0, url.indexOf("/"));
  const endpoint = url.substring(url.indexOf("/"), url.length);

  callback(endpoints[endpoint]["get"](data));
}

const api = {
  get: getFunction
};