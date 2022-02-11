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
    "sap/ui/core/routing/History",
    'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
], function (BaseController, JSONModel, formatter, Filter,  FilterOperator, MessageToast, FileUploader, MessageBox, Export, ExportTypeCSV, History,exportLibrary, Spreadsheet, ) {
	"use strict";
    var EdmType = exportLibrary.EdmType;
	return BaseController.extend("upload.controller.Upload", {

		formatter: formatter,       
        
        /** 
		onNavBack : function() {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},
*/
        onInit : function () { 
            var oViewModel = new JSONModel({
                busy : true,
                delay : 0
            });

           this._oBusyDialog = new sap.m.BusyDialog(); 
           debugger;
           var oModel = this.getView().getModel("uploadModel");
           if ( oModel !== undefined )
           {
           var refresh = that.getView().getModel("uploadModel").setProperty("/",data);
           }
           this.getRouter().getRoute("Upload").attachMatched(this.onRouteMatched, this);
           this.setModel(oViewModel, "uploadView");           
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
        var oViewModel = this.getModel("uploadView");
        oViewModel.setProperty("/busy", false);

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
                var data = [];var record = {};
                var aCols, errorline, oSettings, oSheet;
                aCols = this.createColumnConfig();
                var fileData = this.getView().getModel("uploadModel").getData();
                errorline = this.getView().getModel("errorLog").getProperty('/');
                var count = errorline.length;
                for (var i = 0; i < count ; i++) {
                  var n = errorline[i]["line"];
                  var fileData = this.getView().getModel("uploadModel").getData();
                  record = fileData[n];
                  data.push(record);
                }
                oSettings = {
                    workbook: { columns: aCols },
                    dataSource: data,
                    fileName: "Error Log"
                };
    
                oSheet = new Spreadsheet(oSettings);
                oSheet.build()
                    .then( function() {
                        MessageToast.show('Spreadsheet export has finished');
                    })
                    .finally(oSheet.destroy);
        },

        // Colums

        createColumnConfig: function() {
			return [
				{
					label: 'Firstname',
					property: 'Firstname',
					width: '25'
				},
                {
					label: 'lastname',
					property: 'lastname',
					width: '25'
				},
                {
					label: 'Age',
					property: 'Age',
					scale: 0
				},
                {
					label: 'Role',
					property: 'Role',
					width: '25'
				},

                ];
		},

        //End of colums
        onUpload : function(oEvent) {
            debugger;
        var oViewModel = this.getModel("uploadView");    
        var oFileUploader = this.getView().byId("idfileUploader");
        
        var domref = oFileUploader.getFocusDomRef();
        var file = domref.files[0];
        var that = this;
        this.fileName = file.name;
        this.fileType = file.type;

        var reader = new FileReader();
        oViewModel.setProperty("/busy", true);
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
            MessageBox.information(count + " Users found in file. Click on Save to load data ");
            //MessageToast.show(count + " Users found in file. Click on Save to load data");
            oViewModel.setProperty("/busy", false);   
          
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
            var data = [];
            var eline = 0;
            var message = false;
            var oViewModel = this.getModel("uploadView");
            var oModel = this.getView().getModel();
            debugger;
            oModel.setUseBatch(true);
            oViewModel.setProperty("/busy", true);
            var fileData = this.getView().getModel("uploadModel").getData();
            var usercount = fileData.length;
            for (var i = 0; i < usercount ; i++) {
                var oData = {};
                oData.Firstname = fileData[i]["Firstname"];
                oData.Lastname =  fileData[i]["lastname"];
                oData.Age = fileData[i]["Age"];
                oData.Role = fileData[i]["Role"];
                debugger;
                oModel.create("/UXT", oData, {success: function(data) {
                    debugger; eline = eline + 1;
                     }, error: function(e) { 
                    // Download Error Data
                    var record = {};eline = eline + 1;
                    debugger;
                    record.line =  eline - 1;
                    data.push(record);
                    if (t.getView().byId("errorId").getEnabled() === false) {
                         t.getView().byId("errorId").setEnabled(true); 
                         }
                    t.getView().getModel("errorLog").setProperty("/",data);
                    //
                    }});
            }
            oModel.submitChanges({
                success: function(data, response) {
                    oViewModel.setProperty("/busy", false);
                },
                error: function(e) {
                    oViewModel.setProperty("/busy", false);
                }
            });
        }
	});
});