// ===========================================================================
// Member variables
// ===========================================================================

// Constants
let STAT_IMAGE_FOLDER = 'stats/'

// Statistics
let stat_data = []
let curr_stat_id = 0
let max_stat_id = 0

// JS DOM elements
let div_stat_name = null
let div_stat_description = null
let div_stat_image = null
let div_stat_source = null
let div_prev_button = null
let div_next_button = null
let div_click_gdr = null
let div_curr_img = null

// ===========================================================================
// Main function (on load of document)
// ===========================================================================

$(document).ready(function()
  {
    // Load div variables
    div_stat_name =         document.getElementById("stat-name")
    div_stat_description =  document.getElementById("stat-description")
    div_stat_image =        document.getElementById("stat-image")
    div_stat_source =       document.getElementById("stat-source")
    div_prev_button =       document.getElementById("prev-button")
    div_next_button =       document.getElementById("next-button")
    div_click_gdr =         document.getElementById("click-gdr")

    // Initially load data
    $.ajax(
      {
        type: "GET",
        url: "data.csv",
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
          // Forever set how many statistics there are
          max_stat_id = stat_data.length-1

          showStat()
          setTimeout(resizeImageMap, 300)
        }
      }
    )

    // Initialize prev/next button
    div_prev_button.onclick = function()
    {
      curr_stat_id = curr_stat_id - 1
      if (curr_stat_id < 0)
        curr_stat_id = max_stat_id-1
      showStat()
    }
    div_next_button.onclick = function()
    {
      curr_stat_id = (curr_stat_id + 1) % max_stat_id
      showStat()
    }

    // Initialize imagemap



  }
)


// ===========================================================================
// Write new stat in the viewport
// ===========================================================================

function testIn()
{
  $('#test-area').css('background-color', 'green')
}
function testOut()
{
  $('#test-area').css('background-color', 'red')
}
function testOff()
{
  $('#test-area').css('background-color', 'grey')
}



// ===========================================================================
// Write new stat in the viewport
// ===========================================================================

function showStat()
{
  // Get current stat data
  let this_stat_data = stat_data[curr_stat_id]

  // Set text
  div_stat_name.innerHTML =
    this_stat_data.title
  div_stat_description.innerHTML =
    this_stat_data.subtitle + ' (' + this_stat_data.year + ')'
  div_stat_source.innerHTML =
    'Quelle: ' + this_stat_data.src_author + ' (' + this_stat_data.src_website + '): "' + this_stat_data.src_title + '", ' +
    'URL: <a target="_blank" href="' + this_stat_data.src_url + '">' + this_stat_data.src_url + '</a>, ' +
    'Zugriff: ' + this_stat_data.src_access

  // Set image
  div_stat_image.src = STAT_IMAGE_FOLDER + this_stat_data.graphic_source
  div_stat_image.alt = this_stat_data.title

  // Set current image
  div_curr_img = document.getElementById('stat-image')
}


// ############################################################################
// # Resize Image Map for current viewport
// ############################################################################

function resizeImageMap()
{
  // Get current dimension of image
  console.log(div_curr_img.clientWidth)
  console.log(div_curr_img.clientHeight)

  // To the edge of the image (px)
  let offset = {
    top:  0,
    left: 0,
  }

  // Inside the image (%)
  let dimensions = {
    top: 0,
    left: 0,
    width: 100,
    height: 100,
  }
  $(div_click_gdr).css('top',     offset.top + dimensions.top + "%")
  $(div_click_gdr).css('left',    offset.left + dimensions.top + "%")
  $(div_click_gdr).css('width',   dimensions.width + "%")
  $(div_click_gdr).css('height',  dimensions.height + "%")

}


// ############################################################################
// # HELPER FUNCTIONS
// ############################################################################

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
