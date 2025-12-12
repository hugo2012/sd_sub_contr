sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/bosch/rb1m/sd/sd_subcontr/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.bosch.rb1m.sd.sd_subcontr.Component", {
        metadata: {
            manifest: "json",
             config: {
                fullWidth: true 
            }
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
             // get setting default values
           
            this.setModel(models.creatStartUpParameters(), "startupParameters");
            this.oComponentData = this.getComponentData().startupParameters;
            var  startupParameters = {
                    ShippingPoint: "",
                    Plant: "",
                    Supplier: "",
                    Warehouse:"",
                    Material:"",
                    _navURL:""
                };

              if(this.oComponentData){
                if(this.oComponentData.ShippingPoint)
                {
                    if(this.oComponentData.ShippingPoint[0]){
                          startupParameters.ShippingPoint = this.oComponentData.ShippingPoint[0]; 
                    }  
                }
                 if(this.oComponentData.Plant)
                {
                    if(this.oComponentData.Plant[0]){
                         startupParameters.Plant = this.oComponentData.Plant[0]; 
                    }  
                }  
               if(this.oComponentData.Supplier)
                {
                    if(this.oComponentData.Supplier[0]){
                       startupParameters.Supplier = this.oComponentData.Supplier[0]; 
                    }  
                }    
                
                if(this.oComponentData.Warehouse)
                {
                    if(this.oComponentData.Warehouse[0]){
                      startupParameters.Warehouse = this.oComponentData.Warehouse[0]; 
                    }  
                }
                //Material
                if(this.oComponentData.Material)
                {
                    if(this.oComponentData.Material[0]){
                        startupParameters.Material = this.oComponentData.Material[0]; 
                    }  
                }
                
            } 
            //get root URl
            let _navURL = window.location.origin + window.location.pathname+ window.location.search;
            startupParameters._navURL = _navURL;    

            this.getModel("startupParameters").setProperty("/startupParameters", startupParameters);
        },
        destroy: function() {
            // Call the prototype's destroy method
             UIComponent.prototype.destroy.apply(this, arguments);
        },
        onBeforeExit: function() {
            this.getAggregation("rootControl").destroy();
        }
    });
});