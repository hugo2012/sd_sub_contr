sap.ui.define([
"sap/ui/core/format/NumberFormat",
"sap/m/Token"
], function (NumberFormat,Token) {
	"use strict";
    return {
            
            /**
         * Returns the correct traffic light icon based on the input value.
         * @param {string} sStatus The status value from the data model.
         * @returns {string} The path to the sap-icon:// icon.
         */
        statusIcon: function (sStatus) {
            //debugger;
            switch (sStatus) {
                case "Success":
                    return "sap-icon://status-positive";
                case "Warning":
                    return "sap-icon://status-critical";
                case "Error":
                    return "sap-icon://status-negative";
                default:
                    return "sap-icon://status-inactive";
            }
        },
         statusColor: function (sStatus) {
            switch (sStatus) {
                case "Success":
                    return "Positive";
                case "Warning":
                    return "Critical";
                case "Error":
                    return "Negative";
                default:
                    return "Neutral";
            }
        },
        
        statusText: function (sStatus) {
            switch (sStatus) {
                case "Success":
                    return "Successful";
                case "Warning":
                    return "Warning";
                case "Error":
                    return "Error";
                default:
                    return "Unknown";
            }
        } ,
        fnFormatNumeric: function(a,b){
           // debugger;
              var oFloatNumberFormat = NumberFormat.getFloatInstance({
                    maxFractionDigits: 0,
                    minFractionDigits : 0,
                    groupingEnabled: true
                } , sap.ui.getCore().getConfiguration().getLocale());   

            var numberRegex = /^\d+$/;
            var t = a;
            // Validate numbers
            var k = numberRegex.test(t); 

            if(a){
               if(k == true) {
                if(b==false || b == ""){
                     return oFloatNumberFormat.format(a);
                }
                else{
                     return a;
                }
               
               }
               else{
                return a;
               }
            }    
            else{
                return a;
            }
            
        }   ,
        fnIsNumeric: function (str) {
            if (typeof str != "string") return false
            return !isNaN(str) && 
                    !isNaN(parseFloat(str)) 
        },
        _fnValidateNumber:function(e)
        {
            var numberRegex = /^\d+$/;
            var t = e.getSource().getValue();
            // Validate numbers
            var a = numberRegex.test(t); 
            if(a== true)
                e.getSource().setValue(t);
            else
                e.getSource().setValue("0")  ;                                                   
        } ,
          fnFormatType: function(a,b){
           // debugger;
            var numberRegex = /^\d+$/;
            var t = a;
            // Validate numbers
            var k = numberRegex.test(t); 
            if(a){
            if(k == true) {
                return sap.m.InputType.Number;
            }    
            else{
                return sap.m.InputType.Text;
            }
            
        } }  ,
         fnFormatDateOdata: function (e) {
            if (e) {
                let t = sap.ui.core.format.DateFormat.getDateInstance({style: "medium", pattern: "yyyy-MM-ddTHH:mm:ss"});
                let a = t.format(e);
                return a
            } else {
                return ""
            }
        },
        fnFormatDateUI5Display: function (e) {
            if (isNaN(new Date(e))) {
                return ""
            }
            var t = e.getDate();
            var a = e.getMonth() + 1;
            var r = e.getFullYear();
            if (t < 10) {
                t = "0" + t
            }
            if (a < 10) {
                a = "0" + a
            }
            var n = t + "." + a + "." + r;
            return n
        },
        formatOdataDateTimeZone: function (e) {
            if (e === null || e === undefined) {
                return ""
            }
            if (isNaN(new Date(e))) {
                return ""
            }
            var t = e.getDate();
            var a = e.getMonth() + 1;
            var r = e.getFullYear();
            if (t < 10) {
                t = "0" + t
            }
            if (a < 10) {
                a = "0" + a
            }
            var n = r + "-" + a + "-" + t + "T00:00:00.0000000Z";
            return n
        },
        fnFormatStringDateTime: function (e) {
            if (e) {
                var t = /(\d{2})\.(\d{2})\.(\d{4})/;
                var a = new Date(e.replace(t, "$3-$2-$1"));
                return a
            }
        },
        fnRemoveArrDuplicates: function (e) {
            let t = [];
            for (let a = 0; a < e.length; a++) {
                if (t.indexOf(e[a]) === -1) {
                    if (e[a]) {
                        t.push(e[a])
                    }
                }
            }
            return t
        },
        isDateValid: function (e) {
            let t = /^\d{2}([.])\d{2}\1\d{4}$/;
            if (!isNaN(new Date(e))) {
                if (e.match(t)) {
                    return true
                } else {
                    return false
                }
            } else {
                if (e.match(t)) {
                    return true
                } else {
                    return false
                }
            }
        },
        onValidateEmail: function (e) {
            var t = e.getSource();
            var a = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
            if (! t.getValue().match(a)) {
                t.setValueState(sap.ui.core.ValueState.Error);
                t.setValueStateText("Invalid e-mail address")
            } else {
                t.setValueState(sap.ui.core.ValueState.SUCCESS)
            }
        },
        fnInitDateToken: function () {
            let t = new Date;
            let a = t.getDate() - 10;
            t.setDate(a);
            let r = new Date;
            let n = this.fnFormatDateUI5Display(t);
            let i = this.fnFormatDateUI5Display(r);
            let u = n + "..." + i;
            var l = new Token({key: u, text: u}).data("range", {
                include: true,
                operation: sap.ui.model.FilterOperator.BT,
                keyField: "Date",
                value1: t,
                value2: r
            });
            let f = [];
            f.push(l);
            let s = f;
            return s
        }
   }; 
}); 