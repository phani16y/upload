sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/unified/FileUploader",
    "sap/m/MessageBox",
    "sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/routing/History"
], function (BaseController, JSONModel, formatter, Filter,  FilterOperator, MessageToast, FileUploader, MessageBox, Export, ExportTypeCSV, History ) {
	"use strict";

	return BaseController.extend("upload.controller.Upload", {

		formatter: formatter,       

        /** 
		onNavBack : function() {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},
*/
        onInit : function () { 
           this._oBusyDialog = new sap.m.BusyDialog(); 
           debugger;
           var oModel = this.getView().getModel("uploadModel");
           if ( oModel !== undefined )
           {
           var refresh = that.getView().getModel("uploadModel").setProperty("/",data);
           }
           this.getRouter().getRoute("Upload").attachMatched(this.onRouteMatched, this);
                     
        },

        onRouteMatched : function (oEvent) {
            debugger;
            window.onhashchange = function () {
                 if (window.innerDocClick) { 

                 } 
                 else { if (window.location.hash === '#/fileUpload') { 
                     location.reload(); 
                    } 
                    }
        }
    },
        
        onback : function () {
            debugger;
            var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
                location.reload();
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("worklist", {}, true);
			}
            //this.getOwnerComponent().getRouter().navTo("targetUserlist");
           //  history.go(-1);

        },

        onDownload : function () {
                debugger;
              //  this.getView().getModel("errorLog");
                var oExport = new Export({

                    // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                    exportType : new ExportTypeCSV({
                        separatorChar : ",",
                        charset : "utf-8"
                    }),
    
                    // Pass in the model created above
                    models : this.getView().getModel("errorLog"),
    
                    // binding information for the rows aggregation
                    rows : {
                        path : "/"
                    },   
                    // column definitions with column name and binding info for the content  
                    columns : [{
                        name : "Error",
                        template : {
                            content : "{msg}"
                        }
                    }]
                });
    
                // download exported file
                oExport.saveFile().catch(function(oError) {
                    MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
                }).then(function() {
                    oExport.destroy();
                });
        },

        
        onUpload : function(oEvent) {
            debugger;
        var oFileUploader = this.getView().byId("idfileUploader");
        
        var domref = oFileUploader.getFocusDomRef();
        var file = domref.files[0];
        var that = this;
        this.fileName = file.name;
        this.fileType = file.type;

        var reader = new FileReader();
        reader.onload = function(e) {
            //get access to content of the file
            debugger;
            //convert array to json model
           var array = e.srcElement.result.toString().replaceAll("\r\n",",").split(",");
            array.splice(array.length-1,1);
          // var array = e.currentTarget.result.match(/[\w . ]+(?=,?)/g);
            var noofcol = 4;
            var header = array.splice(0,noofcol);
            var data = [];
            var count = 0;
            while (array.length > 0) {
                var record = {};
                var exceldata = array.splice(0,noofcol);
                for (var i = 0; i < exceldata.length; i++) {
                    record[header[i]] = exceldata[i].trim();
                
                }
                data.push(record);
                count = count +1;
            }
            debugger;
            that.getView().getModel("uploadModel").setProperty("/",data);
            MessageBox.information(count + " Users found in file. Click on Save to load data in IAS");
            //MessageToast.show(count + " Users found in file. Click on Save to load data");
             
            
      
        };
    // File Reader to read the file
       // reader.readAsDataURL(file);
      
       reader.readAsBinaryString(file);
	    debugger;
	  /**  // Bind the data to the Table
	    var oModel = new JSONModel(model);
	    oModel.setData(data);
	    var oTable = that.byId("idTable");
	    oTable.setModel(oModel);
        **/

        },

        onCancel : function () {
            location.reload();
            history.go(-1);
        },

        onSave : function () {
            debugger;
            var t = this;
            var message = false;
            var data = [];
          var fileData = this.getView().getModel("uploadModel").getData();
            var usercount = fileData.length;
            for (var i = 0; i < usercount ; i++) {
                debugger;
            var username = fileData[i]["User Name"];
            var displayname = fileData[i]["Display Name"];
            var family = fileData[i]["Family Name"];
            var middle = fileData[i]["Family Name"];
            var emailid = fileData[i].Email;

            this.getView().getModel("createUserbody").setProperty("/userName", username);
            this.getView().getModel("createUserbody").setProperty("/displayName", displayname);
            this.getView().getModel("createUserbody").setProperty("/name/familyName", family);
            this.getView().getModel("createUserbody").setProperty("/name/givenName", middle);

            var emailprop = this.getView().getModel("createUserbody").getProperty("/emails");
            emailprop[0].value = emailid;
            var body = JSON.stringify(this.getView().getModel("createUserbody").oData);
            var sPath = 'IAS/Users';
            var xurl =  this.getOwnerComponent().getManifestObject().resolveUri(sPath);
            $.ajax({
                type: "POST",
                contentType: "application/scim+json",
                url: xurl,
                data: body,
                success: function (data, txtStatus, jqXHR) {
                  //  var msg = 'User in IAS with unique id: ' + data.id + ' is created succesfully';
                    //MessageToast.show(msg);
                  //  debugger;
                  //  MessageBox.success(msg);
                 //   sg }),
                 /*
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "OK",
                            press: function () {
                                debugger;
                                that.close();
                            }.bind(dialogbox)
                        })
                    });
                    var that = dialogbox;
                    dialogbox.open(); */
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    var record = {};
                    record.msg = 'Error:' + jqXhr.responseText;
                    data.push(record);
                    if (t.getView().byId("errorId").getEnabled() === false) {
                         t.getView().byId("errorId").setEnabled(true); 
                         }
                    debugger;
                    t.getView().getModel("errorLog").setProperty("/",data);
                    if ( message === false ) {
                        MessageBox.information("Please download and check Error log for more details");
                        message = true;
                    }
                }
            })

            }

        }

	});
});