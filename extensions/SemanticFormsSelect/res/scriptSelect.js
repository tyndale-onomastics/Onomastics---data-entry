/* jshint esversion: 6 */
/* jshint quotmark: double */
/* globals mw, console, _, alert */

// Global var for easier debug! :/
var SFSelectFields = [];

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

  class SFSelectField {
    constructor(config) {
      this.config = config;
      this.selectField = $(`select[name*="${config.selectfield}"]`)[0];

      var argumentFieldSelector = config.valuefield.map(field => {
        let pattern = `[name^="${config.valuetemplate}"][name*="${field}"]`;
        return `input${pattern}, select${pattern}`;
      });

      this.argumentFields = $(argumentFieldSelector.join(", "));

      this.initChangeEvents();
    }

    initChangeEvents() {
      _.map(this.argumentFields, argumentField => {
        $(argumentField).change(() => this.requestValues());
      });
    }

    get query() {
      var query = this.config.selectquery || this.config.selectfunction;

      query = query.replace("@@@@", this.argumentFields.val());
      // _.map(this.argumentFields, element => {});

      // This removes empty query arguments, matching strings ending with ::]]
      // such as [[For language::]]
      query = query.replace(/\[\[[\w+\s]*::]]/, "");

      return query;
    }

    // Set up request parameters
    get requestParams() {
      return {
        action: "sformsselect",
        format: "json",
        sep: this.config.sep,
        query: this.query,
        approach: this.config.selectquery ? "smw" : "function"
      };
    }

    /**
     * Make API request for values
     */
    requestValues() {
      $.get(mw.config.get("wgScriptPath") + "/api.php", this.requestParams)
        .done(data => {
          if (data.error) {
            alert("Oops, the query didn't work");
            console.error("Error!");
            console.debug(data);
          }

          this.setValues(data.sformsselect.values);
        })
        .fail(data => {
          alert("Oops, the query didn't work");
          console.error("Error!");
          console.debug(data);
        });
    }

    setValues(values) {
      this.selectField.options.length = 0;
      values.map((value, key) => {
        this.selectField.options[key] = new Option(value);
      });
    }
  }

  // Get the config and map to the SFSelectField class
  _.uniqBy(
    $.parseJSON(mw.config.get("sf_select")),
    SFSelect => SFSelect.selectfield
  ).map(SFSelect => {
    SFSelectFields.push(new SFSelectField(SFSelect));
  });
})(jQuery);
