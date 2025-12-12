sap.ui.define([
    "sap/m/Input", "sap/m/InputBase"
], function (e, t) {
    "use strict";
    var i = e.extend("customInput", {
        metadata: {
            properties: {
                backgroundColor: "sap.ui.core.CSSColor",
                fixRowColor: "sap.ui.core.CSSColor",
                inputColorMode: "object",
                showValueHelpIcon: "boolean"
            }
        },
        onBeforeRendering: function () {
            t.prototype.onBeforeRendering.call(this)
        },
        onAfterRendering: function () {
            if (e.prototype.onAfterRendering) {
                e.prototype.onAfterRendering.apply(this, arguments)
            }
            if (this.getShowValueHelpIcon()) {
                var t = this.getAggregation("_endIcon") || [],
                    i = t[0];
                i = this._getValueHelpIcon();
                i.setProperty("visible", true, true);
                i.setVisible(true);
                i.bOutput = "visible";
                this.$().children().children().css("height", "100%")
            }
            if (this.getInputColorMode()) {
               // debugger;
                var o = this.getInputColorMode(),
                    r;
              
  /*                if(this.getProperty("type") == sap.m.InputType.Text) {
                    if (this.getEditable()) 
                    r = o.edit;
                    else 
                    r = o.fixed;  
                 }
                 else  */
                if(this.getProperty("type") == sap.m.InputType.Text) {
                    if (this.getEditable()) 
                        r = o.edit;
                    // else if (this.$().parentsUntil("table").last().parent()[0].className.indexOf("sapUiTableCtrlFixed") >= 0) 
                    //     r = o.fixed;
                     else 
                        r = o.fixed;           
                 }
                 else if(this.getProperty("type") == sap.m.InputType.Email) {
                    //edit
                     r = o.assembly;
                 }
                 else if( this.getProperty("type") == sap.m.InputType.Number){
                    r = o.noneEdit;
                 }
               
                this.$().css("width", "100%");
                this.$().css("padding", "0");
                this.$().children().css("border", "0");
                this.$().children().css("height", "1.4rem");
                this.$().parentsUntil("td").last().css("padding", "0");
                this.$().css("background-color", r);
                this.$().children().css("background-color", r);
                this.$().children().children().css("background-color", r)
            }
        },
        renderer: {}
    });
    return i
});

