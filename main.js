// ===========================================================================
// Member variables
// ===========================================================================

// Constants
let STAT_IMAGE_FOLDER = 'stats/'
let HIT_POINTS = 100
let HIT_GDR = "Herzlichen Glückwunsch! Du hast vollkommen überraschend die DDR gefunden!"
let MISS_GDR = "Schade, du hast die DDR leider verfehlt. Schau noch einmal genau hin!"
let SUMMARY =
{
  TITLE: "Herzlichen Glückwunsch – Du hast es geschafft!",
  POINTS_PRE: "Du hast",
  POINTS_SUFF: "Punkten erreicht.",
  RELOAD: "Das hat Spaß gemacht – Ich möchte noch einmal spielen!"
}
let LEVELS =
[
  [0.0,   "Du bist richtig mies! Honecker dreht sich im Grabe um. Nimm dir ein Geschichtsbuch und lies den Teil zwischen Hitler und Mauerfall noch einmal!"],
  [0.2,   "Du bist echt mies! Nimm dir ein Geschichtsbuch und lies den Teil zwischen Hitler und Mauerfall noch einmal!"],
  [0.4,   "Du bist unterdurchschnittlich. Honecker benachrichtigt die Stasi."],
  [0.6,   "Das war ganz in Ordnung. Um Margot und Erich Honecker aber richtig stolz zu machen, solltest du aber noch ein bisschen arbeiten!"],
  [0.8,   "Das war gar nicht mal so schlecht. Margot und Erich Honecker sind stolz auf dich!"],
  [0.99,  "Du bist spitze! Margot Honecker verleiht dir die 'Ehrennadel des Ministeriums für Volksbildung' und Erich Honecker den Titel 'Held der Arbeit'!"],
]

// Statistics
let stat_data = []
let stat_ids = []
let num_stats = 0

// Game mode
let curr_stat_nr = 0
let curr_points = 0
let max_points = 0

// JS DOM elements
let div = null


// ===========================================================================
// Main function (on load of document)
// ===========================================================================

$(document).ready(function()
  {
    // Load div variables
    div =
    {
      stat_name :           document.getElementById("stat-name"),
      stat_description :    document.getElementById("stat-description"),
      stat_image :          document.getElementById("stat-image"),
      stat_source :         document.getElementById("stat-source"),
      click_gdr :           document.getElementById("click-gdr"),
      click_not_gdr :       document.getElementById("click-not-gdr"),
      progress:             document.getElementById("progress"),
      points:               document.getElementById("points"),
      legal_notice_button : document.getElementById("legal-notice-button"),
      legal_notice_overlay: document.getElementById("legal-notice-overlay"),
    }

    // Initially load data
    $.ajax(
      {
        type: "GET",
        // url: "data_short.csv", // short (for develop)
        url: "data.csv", // full
        dataType: "text",
        success: function(data)
        {
          let data_array = CSVToArray(data, "|")
          for (line of data_array)
          {
            stat_data.push(
              {
                'title':          line[0],
                'subtitle':       line[1],
                'year':           line[2],
                'graphic_source': line[3],
                'src_author':     line[4],
                'src_website':    line[5],
                'src_title':      line[6],
                'src_url':        line[7],
                'src_access':     line[8]
              }
            )
          }
          // Forever set how many statistics there are and how many points are to be reached
          num_stats = stat_data.length-1
          max_points = HIT_POINTS * num_stats

          // Initially randomize array
          let stat_id = 0
          while (stat_id < num_stats)
          {
            stat_ids[stat_id] = stat_id
            stat_id++
          }
          stat_ids = shuffle(stat_ids)

          // Initially fill points and progress
          setProgress()
          setPoints()

          // Set initial stat
          showStat()
          setTimeout(resizeImageMap, 300)
        }
      }
    )

    // Initialize legal notice overlay
    // Click on "Impressum" -> turn on
    div.legal_notice_button.onclick = function()
    {
      div.legal_notice_overlay.style.display = "block"
    }

    // Click on overlay -> turn off
    div.legal_notice_overlay.onclick = function()
    {
      div.legal_notice_overlay.style.display = "none"
    }


  }
)


// ===========================================================================
// Write new stat in the viewport
// ===========================================================================

function showStat()
{
  // Get current stat data
  let this_stat_data = stat_data[stat_ids[curr_stat_nr]]

  // Set text
  div.stat_name.innerHTML =
    this_stat_data.title
  div.stat_description.innerHTML =
    this_stat_data.subtitle + ' (' + this_stat_data.year + ')'
  div.stat_source.innerHTML =
    'Quelle: ' + this_stat_data.src_author + ' (' + this_stat_data.src_website + '): "' + this_stat_data.src_title + '", ' +
    'URL: <a target="_blank" href="' + this_stat_data.src_url + '">' + this_stat_data.src_url + '</a>, ' +
    'Zugriff: ' + this_stat_data.src_access

  // Set image
  div.stat_image.src = STAT_IMAGE_FOLDER + this_stat_data.graphic_source
  div.stat_image.alt = this_stat_data.title

  // Set current image
  div.curr_img = document.getElementById('stat-image')
}


// ========================================================================
// # Show summary
// ========================================================================

function showSummary()
{
  // Calculate level
  let hit_rate = curr_points/max_points
  let level_id = 0
  let num_levels = LEVELS.length
  let level_text = LEVELS[level_id][1]
  while (level_id < num_levels-1)
  {
    console.log(hit_rate, LEVELS[level_id][0], level_id, num_levels, level_text);
    if (hit_rate > LEVELS[level_id][0])
    {
      level_id++
      level_text = LEVELS[level_id][1]
    }
    else
    {
      break
    }
  }

  console.log(level_id, level_text);

  // Set summary title
  div.stat_name.innerHTML = SUMMARY.TITLE

  div.stat_description.innerHTML =
    SUMMARY.POINTS_PRE + " " + curr_points + " von " + max_points + " " + SUMMARY.POINTS_SUFF + " <br/> " +
    level_text

  // Set reload button
  let reload_button = document.createElement("button")
  reload_button.setAttribute("id", "reload-button")
  reload_button.innerHTML = SUMMARY.RELOAD
  reload_button.onclick = function ()
  {
    location.reload()
  }
  div.stat_name.parentNode.appendChild(reload_button)

  // Clear stat image and source
  div.stat_image.parentNode.innerHTML = ""
  div.stat_source.innerHTML = ""

}


// ========================================================================
// # Set progress in box
// ========================================================================

function setProgress()
{
  div.progress.innerHTML = curr_stat_nr + " / " + (num_stats)
}


// ========================================================================
// # Set points in box
// ========================================================================

function setPoints()
{
  div.points.innerHTML = curr_points
}


// ========================================================================
// # Set points in box
// ========================================================================

function updateGame(success)
{
  // If success -> Increase points
  if (success)
  {
    curr_points += HIT_POINTS
    setPoints()
  }

  // Increase progress
  curr_stat_nr += 1
  setProgress()

  // Check if game is over
  if (curr_stat_nr == num_stats)
  {
    showSummary()
  }
  else
  {
    // Load next stat
    showStat()
  }

}



// ========================================================================
// # Resize Image Map of GDR position inside the image for current viewport
// ========================================================================

function resizeImageMap()
{
  // Cleanup mouse events
  div.click_gdr.onclick = null

  // Get current dimension of image (px)
  let image_dimensions =
  {
    left:   div.curr_img.offsetLeft,
    top:    div.curr_img.offsetTop,
    width:  div.curr_img.clientWidth,
    height: div.curr_img.clientHeight,
  }

  // Inside the image (%)
  let gdr_position =
  {
    left:   45,
    top:    10,
    right:  5,
    bottom: 38,
  }

  // Calculate final position of image map
  let final_position = image_dimensions
  final_position.left += final_position.width * gdr_position.left/100
  final_position.width *= (1-(gdr_position.left+gdr_position.right)/100)
  final_position.top += final_position.height * gdr_position.top/100
  final_position.height *= (1-(gdr_position.top+gdr_position.bottom)/100)

  $(div.click_gdr).css('top',     final_position.top)
  $(div.click_gdr).css('left',    final_position.left)
  $(div.click_gdr).css('width',   final_position.width)
  $(div.click_gdr).css('height',  final_position.height)

  // Click on GDR (Hit correctly!)

  div.click_gdr.onclick = function()
  {
    updateGame(true)
    // alert(HIT_GDR)
  }

  // Click not on GDR (Miss GDR)
  div.click_not_gdr.onclick = function()
  {
    updateGame(false)
    // alert(MISS_GDR)
  }
}


// ############################################################################
// # HELPER FUNCTIONS
// ############################################################################

// ref: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter)
{
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = (strDelimiter || ",");

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    (
      // Delimiters.
      "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

      // Quoted fields.
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

      // Standard fields.
      "([^\"\\" + strDelimiter + "\\r\\n]*))"
    ),
    "gi"
    );


  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;


  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec( strData )){

    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[ 1 ];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (
        strMatchedDelimiter.length &&
        strMatchedDelimiter !== strDelimiter
      )
      {

      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push( [] );

    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[ 2 ]){

        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        strMatchedValue = arrMatches[ 2 ].replace(
            new RegExp( "\"\"", "g" ),
            "\""
            );

    } else {

        // We found a non-quoted value.
        strMatchedValue = arrMatches[ 3 ];

    }


    // Now that we have our value string, let's add
    // it to the data array.
    arrData[ arrData.length - 1 ].push( strMatchedValue );
  }

  // Return the parsed data.
  return(arrData);
}
