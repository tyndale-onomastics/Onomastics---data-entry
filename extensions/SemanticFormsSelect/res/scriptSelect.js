/* jshint esversion: 6 */
/* jshint quotmark: double */
/* globals mw, console */

(function($) {
  "use strict";

  /**
   * valuetemplate:string,
   * valuefield:string, value is the form field on which other select element depends on. change
   *  on this field will trigger a load event for selectfield.
   * selecttemplate:string
   * selectfield:string
   * selectismultiple:boolean, @todo Whether this template is a multiple template.
   * selectquery or selectfunciton: the query ot function to execute
   * sep: Separator for the list of retrieved values, default ','
   */

  // Get the MW config
  var MM = {
    SFSelect: $.parseJSON(mw.config.get("sf_select"))
  };

  MM.SFSelect.map(SFSelect => {
    //  Set the select element
    SFSelect._selectElement = $(
      "select[name='" +
        SFSelect.valuetemplate +
        "[" +
        SFSelect.selectfield +
        "]']"
    ).first();

    // Get the watch elements for values
    SFSelect._watchElements = SFSelect.valuefield.map(field => {
      let pattern =
        '[name^="' + SFSelect.valuetemplate + '"]' + '[name*="' + field + '"]';
      let elements = $("input" + pattern + ", select" + pattern);

      // Add a function to get the current values
      SFSelect.values = () => {
        return elements.val();
      };

      return elements;
    });
  });

  // Watch for changes bubbling up to the form
  $("form#pfForm").change(function(event) {
    // Only act on inputs and select changes
    if (
      event.target.tagName.toLowerCase() !== "input" &&
      event.target.tagName.toLowerCase() !== "select"
    ) {
      return false;
    }

    // Iterate over the SFSelect inputs
    MM.SFSelect.map(SFSelect => {
      // Drop out if the change target is the selectElement
      if (event.target === SFSelect._selectElement[0]) {
        return false;
      }

      // Initiate request parameters
      let requestParams = {
        action: "sformsselect",
        format: "json",
        sep: SFSelect.sep,
        query: SFSelect.selectquery || SFSelect.selectfunction,
        approach: SFSelect.selectquery ? "smw" : "function"
      };

      SFSelect._watchElements
        .map(e => e.val())
        .map(value => {
          requestParams.query = requestParams.query.replace(
            "@@@@",
            value
            // TODO: Join values of a multiple section field?
            // value.join(SFSelect.selectquery ? "||" : ", ")
          );
        });

      // This removes empty query arguments, matching strings ending with ::]]
      // such as [[For language::]]
      requestParams.query = requestParams.query.replace(/\[\[[\w+\s]*::]]/, "");

      SFSelect._selectElement[0].options.length = 0;

      $.get(mw.config.get("wgScriptPath") + "/api.php", requestParams)
        .done(function(data) {
          if (data.error) {
            alert("Oops, the query didn't work");
            console.error("Error!");
            console.debug(data);
          }

          data.sformsselect.values.map((value, key) => {
            SFSelect._selectElement[0].options[key] = new Option(value);
          });
        })
        .fail(function(data) {
          alert("Oops, the query didn't work");
          console.error("Error!");
          console.debug(data);
        });
    });
  });
})(jQuery);
