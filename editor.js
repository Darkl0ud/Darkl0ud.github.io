// DisplayGenerator main Javascript code
// Repository: https://github.com/rickkas7/DisplayGenerator
// License: MIT

var screenx = 128;
var screeny = 64;
var zoom = 3;
var margin = 4;
var showMini = true;
var miniMargin = 2;
var miniSeparator = 10;
var yellowTopSize = 16;
var displayWhite = '#e2fdff';
var displayYellow = '#fdf020';
var displayBlue = '#4bd3ff';

var gfx;
var mainApp;
var iconApp;
var selectedCmd;

var Module = {
		onRuntimeInitialized: function() {
			// console.log('Enscripten loaded!');
			
			// Create an Adafruit GFX 1-bit deep bitmap of screenx x screeny pixels
			// Note: when using the short display the GFX screen size is still set at
			// 128x64, it's just the bottom half isn't rendered to the screen.
			gfx = new Module.TestGFX(screenx, screeny);

			initializeVue();	
		}
};

function initializeVue() {

	Vue.component('cmd-list', {
		data: function() {
			return {
				selectedCmd:''
			};
		},
		props: ['command','fonts','selectedCommandId'],
		mounted: function() {
			this.selectedCmd = this.selectedCommandId;
		},
		template: `
			<div>
			<p><input type="radio" v-bind:value="command.id" v-on:change="radioChanged" name="selectedCmd" v-model="selectedCmd" />
			<span v-if="command.op === 'writePixel'">
			writePixel: x = <input v-model="command.x" size="4"> y = <input v-model="command.y" size="4"> 
			color = <input v-model="command.color" size="4">
			</span>
			<span v-if="command.op === 'drawLine'">
			drawLine: x0 = <input v-model="command.x0" size="4"> y0 = <input v-model="command.y0" size="4"> 
			x1 = <input v-model="command.x1" size="4"> y1 = <input v-model="command.y1" size="4">
			color = <input v-model="command.color" size="4">
			</span>
			<span v-if="command.op === 'drawRect'">
			drawRect: x = <input v-model="command.x" size="4"> y = <input v-model="command.y" size="4"> 
			w = <input v-model="command.w" size="4"> h = <input v-model="command.h" size="4">
			color = <input v-model="command.color" size="4">
			</span>
			<span v-if="command.op === 'fillRect'">
			fillRect: x = <input v-model="command.x" size="4"> y = <input v-model="command.y" size="4"> 
			w = <input v-model="command.w" size="4"> h = <input v-model="command.h" size="4">
			color = <input v-model="command.color" size="4">
			</span>
			<span v-if="command.op === 'drawRoundRect'">
			drawRoundRect: x = <input v-model="command.x" size="4"> y = <input v-model="command.y" size="4"> 
			w = <input v-model="command.w" size="4"> h = <input v-model="command.h" size="4">
			r = <input v-model="command.r" size="4"> color = <input v-model="command.color" size="4">
			</span>
			<span v-if="command.op === 'fillRoundRect'">
			fillRoundRect: x = <input v-model="command.x" size="4"> y = <input v-model="command.y" size="4"> 
			w = <input v-model="command.w" size="4"> h = <input v-model="command.h" size="4">
			r = <input v-model="command.r" size="4"> color = <input v-model="command.color" size="4">
			</span>
			<span v-if="command.op === 'drawCircle'">
			drawCircle: x = <input v-model="command.x" size="4"> y = <input v-model="command.y" size="4"> 
			r = <input v-model="command.r" size="4"> 
			color = <input v-model="command.color" size="4">
			</span>
			<span v-if="command.op === 'fillCircle'">
			fillCircle: x = <input v-model="command.x" size="4"> y = <input v-model="command.y" size="4"> 
			r = <input v-model="command.r" size="4"> 
			color = <input v-model="command.color" size="4">
			</span>
			<span v-if="command.op === 'drawTriangle'">
			drawTriangle: x0 = <input v-model="command.x0" size="4"> y0 = <input v-model="command.y0" size="4"> 
			x1 = <input v-model="command.x1" size="4"> y1 = <input v-model="command.y1" size="4">
			x2 = <input v-model="command.x2" size="4"> y2 = <input v-model="command.y2" size="4">
			color = <input v-model="command.color" size="4">
			</span>
			<span v-if="command.op === 'fillTriangle'">
			fillTriangle: x0 = <input v-model="command.x0" size="4"> y0 = <input v-model="command.y0" size="4"> 
			x1 = <input v-model="command.x1" size="4"> y1 = <input v-model="command.y1" size="4">
			x2 = <input v-model="command.x2" size="4"> y2 = <input v-model="command.y2" size="4">
			color = <input v-model="command.color" size="4">
			</span>
			<span v-if="command.op === 'setCursor'">
			setCursor: x = <input v-model="command.x" size="4"> y = <input v-model="command.y" size="4"> 
			</span>
			<span v-if="command.op === 'setFont'">
			setFont: 
			<select v-model="command.font">
			<option v-for="font in fonts" v-bind:value="font">
			{{ font }}
			</option>
			</select>
			</span>
			<span v-if="command.op === 'setTextColor'">
			setTextColor: <input type="checkbox" v-model="command.invert"/>Inverted Color (only works for default font)
			</span>
			<span v-if="command.op === 'setTextSize'">
			setTextSize: size = <input v-model="command.size" size="4">
			</span>
			<span v-if="command.op === 'setTextWrap'">
			setTextWrap: w = <input v-model="command.w" size="4"> (0 = no wrap, 1 = wrap. Default is no wrap.)
			</span>
			<span v-if="command.op === 'print'">
			print: <input v-model="command.text" size="20">
			</span>
			<span v-if="command.op === 'println'">
			println: <input v-model="command.text" size="20">
			</span>
			<span v-if="command.op === 'printCentered'">
			printCentered: <input v-model="command.text" size="20"> width = {{command.width}}
			</span>
			<span v-if="command.op === 'drawIcon'">
			drawIcon: x = <input v-model="command.x" size="4"> y = <input v-model="command.y" size="4"> 
			color = <input v-model="command.color" size="4">
			width = {{command.width}} height= {{command.height}} <br/> 
			bitmap = <input v-model="command.bitmap" size="50">
			</span>
			</p>
			</div>
			`,
			watch: {
				$props: {
					handler(val) {			
						processCommands();
					},
					deep: true
				},
				selectedCommandId: {
					handler(val) {
						this.selectedCmd = this.command.id.toString();
					}
				}
			},
			methods: {
				radioChanged: function() {
					mainApp.selectedCommandId = this.selectedCmd;
				}
			}
	});

	var fontArray = [];
	var fontVector = gfx.getFonts();

	fontArray.push("Default")
	for(var ii = 0; ii < fontVector.size(); ii++) {
		var name = fontVector.get(ii);
		fontArray.push(name);
	}

	mainApp = new Vue({
		el: '#mainApp',
		data: {
			commands: [
				{id:1, op:'setTextColor', invert:false},
				{id:2, op:'setTextSize', size:"1"},
				{id:3, op:'setFont', font:"Default"},
				{id:4, op:'setCursor', x:"0", y:"10"},
				{id:5, op:'println', text:"HELLO WORLD"}
				],
			fonts: fontArray,
			commandNames: [
				'writePixel', 'drawLine','drawRect','fillRect','drawRoundRect','fillRoundRect',
				'drawCircle','fillCircle', 'drawTriangle','fillTriangle',
				'setCursor', 'setTextColor', 'setTextSize', 'setTextWrap', 'setFont', 
				'print','println','printCentered',
				'drawIcon'],
			commandDefaults: {
				writePixel:{x:"0", y:"0", color:"1"},
				drawLine:{x0:"0", y0:"0", x1:"10", y1:"10", color:"1"},
				drawRect:{x:"0", y:"0", w:"10", h:"10", color:"1"},
				fillRect:{x:"0", y:"0", w:"10", h:"10", color:"1"},
				drawRoundRect:{x:"0", y:"0", w:"10", h:"10", r:"3", color:"1"},
				fillRoundRect:{x:"0", y:"0", w:"10", h:"10", r:"3", color:"1"},
				drawCircle:{x:"10", y:"10", r:"10", color:"1"},
				fillCircle:{x:"10", y:"10", r:"10", color:"1"},
				drawTriangle:{x0:"0", y0:"0", x1:"20", y1:"0", x2:"10", y2:"10", color:"1"},
				fillTriangle:{x0:"0", y0:"0", x1:"20", y1:"0", x2:"10", y2:"10", color:"1"},
				setCursor:{x:"0", y:"10"},
				setTextColor:{invert:0},
				setTextSize:{size:"1"},
				setTextWrap:{w:"1"},
				setFont:{font:"Default"},
				print:{text:"HELLO"},
				println:{text:"HELLO"},
				printCentered:{text:"HELLO"},
				drawIcon:{x:"0", y:"0", size:"24", width:"24", height:"24", color:"1", bitmap:""}
			},
			nextId:6,
			commandToAdd:'setCursor',
			codeText:'',
			selectedCommandId:-1,
			coordinates:'',
			downloadAppend:false,
			displayType:'normal',
			invertDisplay:false
		},
		methods: {
			addCommand: function() {
				var obj = {op:this.commandToAdd,id:this.nextId++};
				var defs = this.commandDefaults[this.commandToAdd];
				for (var prop in defs) {
					if (defs.hasOwnProperty(prop)) {
						obj[prop] = defs[prop];
					}
				}

				this.commands.push(obj);
				processCommands();

				this.selectedCommandId = obj.id;
			},
			moveUpCommand: function() {
				if (this.selectedCommandId > 0) {
					for(var ii = 1; ii < mainApp.commands.length - 1; ii++) {
						var cmd = mainApp.commands[ii];
						if (cmd.id == this.selectedCommandId) {
							mainApp.commands[ii] = mainApp.commands[ii - 1];
							mainApp.commands[ii - 1] = cmd;
							processCommands();
							break;
						}
					}
				}
			},
			moveDownCommand: function() {
				if (this.selectedCommandId > 0) {
					for(var ii = 0; ii < mainApp.commands.length - 1; ii++) {
						var cmd = mainApp.commands[ii];
						if (cmd.id == this.selectedCommandId) {
							mainApp.commands[ii] = mainApp.commands[ii + 1];
							mainApp.commands[ii + 1] = cmd;
							processCommands();
							break;
						}
					}
				}
			},
			copyCommand: function() {
				if (this.selectedCommandId > 0) {
					for(var ii = 0; ii < mainApp.commands.length; ii++) {
						var cmd = mainApp.commands[ii];
						if (cmd.id == this.selectedCommandId) {
							var cmd2 = {};
							Object.assign(cmd2, cmd);
							cmd2.id = mainApp.nextId++;

							mainApp.commands.splice(ii, 0, cmd2);
							processCommands();
							break;
						}
					}
				}
			},
			uploadCommand: function(event) {
				var files = event.target.files;
				// console.log("files", files);

				if (files.length == 1) {
					// https://www.html5rocks.com/en/tutorials/file/dndfiles/
					var reader = new FileReader();

					// Closure to capture the file information.
					reader.onload = (function(files) {
						return function(e) {
							console.log("result", e.target.result);
							try {
								var json = JSON.parse(e.target.result);
								
								if (mainApp.downloadAppend) {
									for(var ii = 0; ii < json.length; ii++) {
										json[ii].id = mainApp.nextId++;
										mainApp.commands.push(json[ii]);										
									}
								}
								else {
									mainApp.commands = json;
								}
								processCommands();
							}
							catch(e) {

							}
						};
					})(files[0]);

					// Read in the image file as a data URL.
					reader.readAsText(files[0]);
				}
			},
			downloadCommand: function() {
				// https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
				var filename = 'layout.json';
				var file = new Blob([JSON.stringify(mainApp.commands, null, 2)], {type: "text/json"});
				if (window.navigator.msSaveOrOpenBlob) // IE10+
					window.navigator.msSaveOrOpenBlob(file, filename);
				else { // Others
					var a = document.createElement("a");
					var url = URL.createObjectURL(file);
					a.href = url;
					a.download = filename;
					document.body.appendChild(a);
					a.click();
					setTimeout(function() {
						document.body.removeChild(a);
						window.URL.revokeObjectURL(url);  
					}, 0); 
				}
			},
			copyCodeCommand: function() {
				var copyText = document.getElementById("codeTextArea");
				copyText.select();
				document.execCommand("copy");	
			},
			saveCodeCommand: function() {
				var filename = 'code.cpp';
				var file = new Blob([this.codeText], {type: "text/plain"});
				if (window.navigator.msSaveOrOpenBlob) // IE10+
					window.navigator.msSaveOrOpenBlob(file, filename);
				else { // Others
					var a = document.createElement("a");
					var url = URL.createObjectURL(file);
					a.href = url;
					a.download = filename;
					document.body.appendChild(a);
					a.click();
					setTimeout(function() {
						document.body.removeChild(a);
						window.URL.revokeObjectURL(url);  
					}, 0); 
				}
			},
			deleteCommand: function() {
				if (this.selectedCommandId > 0) {
					var nextId = -1;
					
					for(var ii = 0; ii < mainApp.commands.length; ii++) {
						var cmd = mainApp.commands[ii];
						if (cmd.id == this.selectedCommandId) {
							if ((ii + 1) < mainApp.commands.length) {
								nextId = mainApp.commands[ii + 1].id;
							}

							mainApp.commands.splice(ii, 1);
							processCommands();
							
							break;
						}
					}
					if (nextId >= 0) {
						this.selectedCommandId = nextId;
					}
					else {
						this.selectedCommandId = -1;
					}
				}
			},
			deleteAllCommand: function() {
				mainApp.commands = [];
				mainApp.selectedCommandId = -1;
				processCommands();
			},
			canvasClick: function(event) {
				var rect = event.target.getBoundingClientRect();
				var x = event.clientX - rect.left;
				var y = event.clientY - rect.top;

				var cx = Math.round((x - margin) / zoom);
				if (cx < 0) {
					cx = 0;
				}
				if (cx > screenx) {
					cx = screenx;
				}
				var cy = Math.round((y - margin) / zoom);
				if (cy < 0) {
					cy = 0;
				}
				if (cy > screeny) {
					cy = screeny;
				}

				this.coordinates = '(' + cx + ', ' + cy + ')';

				//console.log("event x=" + x + " y=" + y, event);
			}
		},
		watch: {
			selectedCommandId: {
				handler(val) {
					// Update global variable, used by icon app
					selectedCmd = findCommandById(val);
					if (selectedCmd && selectedCmd.op === 'drawIcon') {
						document.getElementById('iconApp').style.display = 'block';
					}
					else {
						document.getElementById('iconApp').style.display = 'none';					
					}
					if (iconApp.showCode || !selectedCmd || selectedCmd.op !== 'drawIcon') {						
						document.getElementById('codeOutput').style.display = 'block';					
					}
					else {
						document.getElementById('codeOutput').style.display = 'none';											
					}
				}
			},
			displayType: {
				handler(val) {
					if (val === 'short') {
						// 128x32
						screeny = 32;
					}
					else {
						// 128x64
						screeny = 64;
					}
					
					document.getElementById('mainCanvas').height = mainCanvasHeight();
					
					processCommands();
				}
			},
			invertDisplay: {
				handler(val) {
					processCommands();
				}
			}
		}
	});


	Vue.component('iconRow', {
		props: ['name','iconNames'],
		template: `
			<tr v-on:click="selectIcon">
			<td><img :src="path" width="24" height="24" :id="imgId"/></td>
			<td>{{name}}</td>
			</tr>
			`,
			computed: {
				path: function() {
					return 'feather/' + this.name + '.svg';
				},
				imgId: function() {
					return 'img' + this.name;
				}
			},
			methods: {
				selectIcon: function(event) {
					iconApp.selectedIconName = this.name;
				}
			}
	});
	iconApp = new Vue({
		el: '#iconApp',
		data: {
			iconNames: [
				"activity",
				"airplay",
				"alert-circle",
				"alert-octagon",
				"alert-triangle",
				"align-center",
				"align-justify",
				"align-left",
				"align-right",
				"anchor",
				"aperture",
				"archive",
				"arrow-down-circle",
				"arrow-down-left",
				"arrow-down-right",
				"arrow-down",
				"arrow-left-circle",
				"arrow-left",
				"arrow-right-circle",
				"arrow-right",
				"arrow-up-circle",
				"arrow-up-left",
				"arrow-up-right",
				"arrow-up",
				"at-sign",
				"award",
				"bar-chart-2",
				"bar-chart",
				"battery-charging",
				"battery",
				"bell-off",
				"bell",
				"bluetooth",
				"bold",
				"book-open",
				"book",
				"bookmark",
				"box",
				"briefcase",
				"calendar",
				"camera-off",
				"camera",
				"cast",
				"check-circle",
				"check-square",
				"check",
				"chevron-down",
				"chevron-left",
				"chevron-right",
				"chevron-up",
				"chevrons-down",
				"chevrons-left",
				"chevrons-right",
				"chevrons-up",
				"chrome",
				"circle",
				"clipboard",
				"clock",
				"cloud-drizzle",
				"cloud-lightning",
				"cloud-off",
				"cloud-rain",
				"cloud-snow",
				"cloud",
				"code",
				"codepen",
				"codesandbox",
				"coffee",
				"columns",
				"command",
				"compass",
				"copy",
				"corner-down-left",
				"corner-down-right",
				"corner-left-down",
				"corner-left-up",
				"corner-right-down",
				"corner-right-up",
				"corner-up-left",
				"corner-up-right",
				"cpu",
				"credit-card",
				"crop",
				"crosshair",
				"database",
				"delete",
				"disc",
				"dollar-sign",
				"download-cloud",
				"download",
				"droplet",
				"edit-2",
				"edit-3",
				"edit",
				"external-link",
				"eye-off",
				"eye",
				"facebook",
				"fast-forward",
				"feather",
				"figma",
				"file-minus",
				"file-plus",
				"file-text",
				"file",
				"film",
				"filter",
				"flag",
				"folder-minus",
				"folder-plus",
				"folder",
				"framer",
				"frown",
				"gift",
				"git-branch",
				"git-commit",
				"git-merge",
				"git-pull-request",
				"github",
				"gitlab",
				"globe",
				"grid",
				"hard-drive",
				"hash",
				"headphones",
				"heart",
				"help-circle",
				"hexagon",
				"home",
				"image",
				"inbox",
				"info",
				"instagram",
				"italic",
				"key",
				"layers",
				"layout",
				"life-buoy",
				"link-2",
				"link",
				"linkedin",
				"list",
				"loader",
				"lock",
				"log-in",
				"log-out",
				"mail",
				"map-pin",
				"map",
				"maximize-2",
				"maximize",
				"meh",
				"menu",
				"message-circle",
				"message-square",
				"mic-off",
				"mic",
				"minimize-2",
				"minimize",
				"minus-circle",
				"minus-square",
				"minus",
				"monitor",
				"moon",
				"more-horizontal",
				"more-vertical",
				"mouse-pointer",
				"move",
				"music",
				"navigation-2",
				"navigation",
				"octagon",
				"package",
				"paperclip",
				"pause-circle",
				"pause",
				"pen-tool",
				"percent",
				"phone-call",
				"phone-forwarded",
				"phone-incoming",
				"phone-missed",
				"phone-off",
				"phone-outgoing",
				"phone",
				"pie-chart",
				"play-circle",
				"play",
				"plus-circle",
				"plus-square",
				"plus",
				"pocket",
				"power",
				"printer",
				"radio",
				"refresh-ccw",
				"refresh-cw",
				"repeat",
				"rewind",
				"rotate-ccw",
				"rotate-cw",
				"rss",
				"save",
				"scissors",
				"search",
				"send",
				"server",
				"settings",
				"share-2",
				"share",
				"shield-off",
				"shield",
				"shopping-bag",
				"shopping-cart",
				"shuffle",
				"sidebar",
				"skip-back",
				"skip-forward",
				"slack",
				"slash",
				"sliders",
				"smartphone",
				"smile",
				"speaker",
				"square",
				"star",
				"stop-circle",
				"sun",
				"sunrise",
				"sunset",
				"tablet",
				"tag",
				"target",
				"terminal",
				"thermometer",
				"thumbs-down",
				"thumbs-up",
				"toggle-left",
				"toggle-right",
				"trash-2",
				"trash",
				"trello",
				"trending-down",
				"trending-up",
				"triangle",
				"truck",
				"tv",
				"twitter",
				"type",
				"umbrella",
				"underline",
				"unlock",
				"upload-cloud",
				"upload",
				"user-check",
				"user-minus",
				"user-plus",
				"user-x",
				"user",
				"users",
				"video-off",
				"video",
				"voicemail",
				"volume-1",
				"volume-2",
				"volume-x",
				"volume",
				"watch",
				"wifi-off",
				"wifi",
				"wind",
				"x-circle",
				"x-octagon",
				"x-square",
				"x",
				"youtube",
				"zap-off",
				"zap",
				"zoom-in",
				"zoom-out"
				],
				square: true,
				size: "24",
				width: "24",
				height: "24",
				weight: "64",
				selectedIconName: "",
				search: "alert",
				hex: "",
				showCode: false,
				standardLogoSelect: ""
		},
		watch: {
			square: "updateIcon",
			size: "updateIcon",
			width: "updateIcon",
			height: "updateIcon",
			weight: "updateIcon",
			selectedIconName: "updateIcon",
			showCode: function() {
				if (this.showCode) {						
					document.getElementById('codeOutput').style.display = 'block';					
				}
				else {
					document.getElementById('codeOutput').style.display = 'none';											
				}
			},
			standardLogoSelect: "updateIcon"
		},
		computed: {
			filteredIconNames: function() {
				var search = this.search;

				return this.iconNames.filter(function(name) {
					if (this.search != '') {
						return (name.indexOf(search) >= 0);
					}
					else {
						// Return all
						return true;
					}
				})
			}
		},
		methods: {			
			searchAll: function() {
				this.search = '';
			},
			uploadIconCommand: function(event) {
				var files = event.target.files;
				// console.log("files", files);

				if (files.length == 1) {
					// https://www.html5rocks.com/en/tutorials/file/dndfiles/
					var reader = new FileReader();

					// Closure to capture the file information.
					reader.onload = (function(files) {
						return function(e) {
							// 
							this.selectedIconName = '';
							
							var iconImg = document.getElementById('iconImg');
							iconImg.style.display = 'block';
							iconImg.src = e.target.result;
							setTimeout(function() {
								iconApp.updateIconWithImg(iconImg);
							}, 100);
						};
					})(files[0]);

					// Clear any icon name
					this.selectedIconName = '';
					
					// Read in the image file as a data URL.
					reader.readAsDataURL(files[0]);
				}
			},
			updateIcon: function() {
				if (this.standardLogoSelect != '' && selectedCmd != undefined) {
					
					
					switch(this.standardLogoSelect) {
					case 'p128x32':
						selectedCmd.x = 0;
						selectedCmd.y = (screeny == 32) ? 0 : 16;
						selectedCmd.width = 128;
						selectedCmd.height = 32;
						selectedCmd.bitmap = particle128x32;
						break;
						
					case 'p32x32':
						selectedCmd.x = 48;
						selectedCmd.y = (screeny == 32) ? 0 : 16;
						selectedCmd.width = 32;
						selectedCmd.height = 32;
						selectedCmd.bitmap = particle32x32;
						break;

					case 'p48x48':
						selectedCmd.x = 40;
						selectedCmd.y = (screeny == 32) ? -8 : 8;
						selectedCmd.width = 48;
						selectedCmd.height = 48;
						selectedCmd.bitmap = particle48x48;
						break;

					case 'a82x64':
						selectedCmd.x = 23;
						selectedCmd.y = 0;
						selectedCmd.width = 82;
						selectedCmd.height = 64;
						selectedCmd.bitmap = adafruit82x64;
						break;
						
					case 'a115x32':
						selectedCmd.x = 6;
						selectedCmd.y = 0;
						selectedCmd.width = 115;
						selectedCmd.height = 32;
						selectedCmd.bitmap = adafruit115x32;
						break;
					}

				}
				else
				if (this.selectedIconName != '') {
					var img = document.getElementById('img' + this.selectedIconName);
					iconApp.updateIconWithImg(img);
				}
				else {
					var img = document.getElementById('iconImg');
					iconApp.updateIconWithImg(img);					
				}
			},			
			updateIconWithImg: function(img) {
				var width, height;
				
				if (this.square) {
					width = height = parseInt(this.size);
				}
				else {
					width = parseInt(this.width);
					height = parseInt(this.height);
				}
				// console.log("selectIcon " + this.selectedIconName + " size=" + size);

				var canvas = document.getElementById("iconCanvas");

				var ctx = canvas.getContext("2d");
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				if (width > 5 && width <= 128 && height > 5 && height <= 64) {
					ctx.drawImage(img, 0, 0, width, height);	

					var imageData = ctx.getImageData(0, 0, width, height);
					var pixels = imageData.data;

					var ii = 0;

					var bitmap = [];
					var byte = 0;
					var bitIndex = 7;

					var weight = parseInt(this.weight);

					for(var yy = 0; yy < height; yy++) {
						for(var xx = 0; xx < width; xx++) {
							var red = pixels[ii++];
							var green = pixels[ii++];
							var blue = pixels[ii++];
							var alpha = pixels[ii++];

							//console.log("xx=" + xx + " yy=" + yy + " red=" + red + " green=" + green + " blue=" + blue + " ii=" + ii);

							if ((red > 10 || green > 10 || blue > 10) || alpha >= weight) {
								// Pixel set
								byte |= (1 << bitIndex);
							}
							if (--bitIndex < 0) {
								bitmap.push(byte);
								byte = 0;
								bitIndex = 7;
							}
						}
						if (bitIndex != 7) {
							bitmap.push(byte);
							byte = 0;
							bitIndex = 7;							
						}
					}

					var hex = '';

					for(var ii = 0; ii < bitmap.length; ii++) {
						var value = bitmap[ii];
						if (value < 0x10) {
							hex += '0' + value.toString(16);
						}
						else {
							hex += value.toString(16);							
						}
					}
					// console.log("bitmap=" + hex);
					this.hex = hex;

					// Find last bitmap
					if (selectedCmd != undefined) {
						selectedCmd.width = width;
						selectedCmd.height = height;
						selectedCmd.bitmap = hex;
					}
				} 
			}
		}
	});


	processCommands();
}

function findCommandById(id) {
	for(var ii = 0; ii < mainApp.commands.length; ii++) {
		var cmd = mainApp.commands[ii];
		if (cmd.id == id) {
			return cmd;
		}
	}
	return undefined;
}

function processCommands() {
	// console.log('processCommands', mainApp.commands);

	var codeIncl = '';
	var codeDecl = '';
	var codeImpl = 'void updateDisplay() {\n';

	var indent = '    ';
	var gfxClass = 'display.';

	codeImpl += indent + gfxClass + 'clearDisplay();\n';
	
	gfx.fillScreen(0);
	for(var ii = 0; ii < mainApp.commands.length; ii++) {
		var cmd = mainApp.commands[ii];
		
		switch(cmd.op) {
		case 'writePixel': 
			gfx.writePixel(parseInt(cmd.x), parseInt(cmd.y), parseInt(cmd.color));
			codeImpl += indent + gfxClass + 'writePixel(' + cmd.x + ', ' + cmd.y + ', ' + cmd.color + ');\n';
			break;

		case 'drawLine': 
			gfx.drawLine(parseInt(cmd.x0), parseInt(cmd.y0), parseInt(cmd.x1), parseInt(cmd.y1), parseInt(cmd.color));
			codeImpl += indent + gfxClass + 'drawLine(' + cmd.x0 + ', ' + cmd.y0 + ', ' + cmd.x1 + ', ' + cmd.y1 + ', ' + cmd.color + ');\n';
			break;
			
		case 'drawRect':
			gfx.drawRect(parseInt(cmd.x), parseInt(cmd.y), parseInt(cmd.w), parseInt(cmd.h), parseInt(cmd.color));
			codeImpl += indent + gfxClass + 'drawRect(' + cmd.x + ', ' + cmd.y+ ', ' + cmd.w + ', ' + cmd.h + ', ' + cmd.color + ');\n';
			break;
			
		case 'fillRect':
			gfx.fillRect(parseInt(cmd.x), parseInt(cmd.y), parseInt(cmd.w), parseInt(cmd.h), parseInt(cmd.color));
			codeImpl += indent + gfxClass + 'fillRect(' + cmd.x + ', ' + cmd.y+ ', ' + cmd.w + ', ' + cmd.h + ', ' + cmd.color + ');\n';
			break;
			
		case 'drawRoundRect':
			gfx.drawRoundRect(parseInt(cmd.x), parseInt(cmd.y), parseInt(cmd.w), parseInt(cmd.h), parseInt(cmd.r), parseInt(cmd.color));
			codeImpl += indent + gfxClass + 'drawRoundRect(' + cmd.x + ', ' + cmd.y+ ', ' + cmd.w + ', ' + cmd.h + ', ' + cmd.r + ', ' + cmd.color + ');\n';
			break;
		
		case 'fillRoundRect':
			gfx.fillRoundRect(parseInt(cmd.x), parseInt(cmd.y), parseInt(cmd.w), parseInt(cmd.h), parseInt(cmd.r), parseInt(cmd.color));
			codeImpl += indent + gfxClass + 'fillRoundRect(' + cmd.x + ', ' + cmd.y+ ', ' + cmd.w + ', ' + cmd.h + ', ' + cmd.r + ', ' + cmd.color + ');\n';
			break;
			
		case 'drawCircle':
			gfx.drawCircle(parseInt(cmd.x), parseInt(cmd.y), parseInt(cmd.r), parseInt(cmd.color));
			codeImpl += indent + gfxClass + 'drawCircle(' + cmd.x + ', ' + cmd.y + ', ' + cmd.r + ', ' + cmd.color + ');\n';
			break;
			
		case 'fillCircle':
			gfx.fillCircle(parseInt(cmd.x), parseInt(cmd.y), parseInt(cmd.r), parseInt(cmd.color));
			codeImpl += indent + gfxClass + 'fillCircle(' + cmd.x + ', ' + cmd.y + ', ' + cmd.r + ', ' + cmd.color + ');\n';
			break;
			
		case 'drawTriangle':
			gfx.drawTriangle(parseInt(cmd.x0), parseInt(cmd.y0), parseInt(cmd.x1), parseInt(cmd.y1), parseInt(cmd.x2), parseInt(cmd.y2), parseInt(cmd.color));
			codeImpl += indent + gfxClass + 'drawTriangle(' + cmd.x0 + ', ' + cmd.y0 + ', ' + cmd.x1 + ', ' + cmd.y1 + ', ' + cmd.x2 + ', ' + cmd.y2 + ', ' + cmd.color + ');\n';
			break;
			
		case 'fillTriangle':
			gfx.fillTriangle(parseInt(cmd.x0), parseInt(cmd.y0), parseInt(cmd.x1), parseInt(cmd.y1), parseInt(cmd.x2), parseInt(cmd.y2), parseInt(cmd.color));
			codeImpl += indent + gfxClass + 'fillTriangle(' + cmd.x0 + ', ' + cmd.y0 + ', ' + cmd.x1 + ', ' + cmd.y1 + ', ' + cmd.x2 + ', ' + cmd.y2 + ', ' + cmd.color + ');\n';
			break;
			
		case 'setCursor':
			gfx.setCursor(parseInt(cmd.x), parseInt(cmd.y));
			codeImpl += indent + gfxClass + 'setCursor(' + cmd.x + ', ' + cmd.y + ');\n';
			break;
			
		case 'setFont':
			gfx.setFontByName(cmd.font);
			if (cmd.font === 'Default') {
				codeImpl += indent + gfxClass + 'setFont(NULL);\n';				
			}
			else {
				codeIncl += '#include "' + cmd.font + '.h"\n';

				codeImpl += indent + gfxClass + 'setFont(&' + cmd.font + ');\n';								
			}
			break;
			
			
		case 'setTextColor':
			if (!cmd.invert) {
				gfx.setTextColor(1);
				codeImpl += indent + gfxClass + 'setTextColor(WHITE);\n';				
			}
			else {
				gfx.setTextColor2(0, 1);
				codeImpl += indent + gfxClass + 'setTextColor(BLACK, WHITE);\n';				
			}
			break;
			
		case 'setTextSize':
			gfx.setTextSize(parseInt(cmd.size));
			codeImpl += indent + gfxClass + 'setTextSize(' + cmd.size + ');\n';
			break;
			
		case 'setTextWrap':
			gfx.setTextWrap(parseInt(cmd.w));
			codeImpl += indent + gfxClass + 'setTextWrap(' + cmd.w + ');\n';
			break;
		
		case 'print':
			gfx.print(cmd.text);
			codeImpl += indent + gfxClass + 'print(' + quotedC(cmd.text) + ');\n';
			break;
		
		case 'println':
			gfx.println(cmd.text);
			codeImpl += indent + gfxClass + 'println(' + quotedC(cmd.text) + ');\n';
			break;
			
		case 'printCentered':
			{
				gfx.setTextWrap(0);
				codeImpl += indent + gfxClass + 'setTextWrap(0);\n';
	
				var cursorY = gfx.getCursorY();
				cmd.width = gfx.measureTextX(cmd.text);
				var cursorX = Math.floor((screenx / 2) - (cmd.width / 2));
								
				gfx.setCursor(cursorX, cursorY);
				codeImpl += indent + gfxClass + 'setCursor(' + cursorX + ', ' + cursorY + ');\n';

				gfx.println(cmd.text);
				codeImpl += indent + gfxClass + 'println(' + quotedC(cmd.text) + ');\n';
			}
			break;
																
		case 'drawIcon':
			if (cmd.bitmap != '' && parseInt(cmd.width) > 0 && parseInt(cmd.height) > 0) {
				var bitmap = new Module.VectorInt();

				var codeHex = '';

				for(var jj = 0; jj < cmd.bitmap.length; jj += 2) {
					var val = parseInt('0x' + cmd.bitmap.substr(jj, 2));
					bitmap.push_back(val);

					codeHex += '0x' + cmd.bitmap.substr(jj, 2) + ', ';
				}	
				gfx.drawBitmap(parseInt(cmd.x), parseInt(cmd.y), bitmap, parseInt(cmd.width), parseInt(cmd.height), parseInt(cmd.color));

				bitmap.delete();

				// Remove the trailing ', '
				codeHex = codeHex.substr(0, codeHex.length - 2);

				codeDecl += 'const uint8_t bitmap' + cmd.id + '[] = {' + codeHex + '};\n';
				codeImpl += indent + gfxClass + 'drawBitmap(' + cmd.x + ', ' + cmd.y + ', bitmap' + cmd.id + ', ' + cmd.width + ', ' + cmd.height + ', ' + cmd.color + ');\n';				
			}
			break;

		default:
			console.log("unknown command", cmd);
			break;
		}
	}
	codeImpl += indent + gfxClass + 'display();\n';

	codeImpl += '}\n';

	mainApp.codeText = codeIncl + codeDecl + '\n' + codeImpl;

	render();
}

function mainCanvasX(x) {
	return margin + x * zoom;
}
function mainCanvasY(y) {
	return margin + y * zoom + ((mainApp.displayType === 'yellow' && y >= yellowTopSize) ? zoom : 0);
}
function mainCanvasWidth() {
	return (2 * margin) + (screenx * zoom);
}
function mainCanvasHeight() {
	return (2 * margin) + (screeny * zoom) + ((mainApp.displayType === 'yellow') ? zoom : 0);
}
function miniCanvasLeft() {
	return (screenx * zoom) + (2 * margin) + miniSeparator;	
}
function miniCanvasX(x) {
	return miniCanvasLeft() + miniMargin + x;
}
function miniCanvasY(y) {
	return miniMargin + y + ((mainApp.displayType === 'yellow' && y >= yellowTopSize) ? 1 : 0);
}
function miniCanvasWidth() {
	return (2 * miniMargin) + screenx;
}
function miniCanvasHeight() {
	return (2 * miniMargin) + screeny + ((mainApp.displayType === 'yellow') ? 1 : 0);
}

function render() {
	// Bytes are left to right, top to bottom, one bit per byte
	// Within the byte 0x80 is the leftmost pixel, 0x40 is the next, ... 0x01 is the rightmost pixel in the byte
	var bytes = gfx.getBytes();

	var canvas = document.getElementById("mainCanvas");
	var ctx = canvas.getContext("2d");

	var yellow = (mainApp.displayType === 'yellow');
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, mainCanvasWidth(), mainCanvasHeight());
	if (showMini) {
		ctx.fillRect(miniCanvasLeft(), 0, miniCanvasWidth(), miniCanvasHeight());
	}

	ctx.fillStyle = displayWhite;


	var byteIndex = 0;
	for(var yy = 0; yy < screeny; yy++) {
		if (yellow) {
			if (yy < yellowTopSize) {
				ctx.fillStyle = displayYellow;				
			}
			else {
				ctx.fillStyle = displayBlue;
			}
		}
		for(var xx = 0; xx < screenx; xx += 8) {
			var pixel8 = bytes[byteIndex++];

			for(var ii = 0; ii < 8; ii++) {
				var pixel = ((pixel8 & (1 << (7 - ii))) != 0) ? 1 : 0;
				
				if (mainApp.invertDisplay) {
					pixel = !pixel;
				}
				
				if (pixel) {
					ctx.fillRect(mainCanvasX(xx + ii), mainCanvasY(yy), zoom, zoom);

					if (showMini) {
						ctx.fillRect(miniCanvasX(xx + ii), miniCanvasY(yy), 1, 1);
					}
					//console.log("set pixel xx=" + (xx + ii) + " yy=" + yy);
				}
			}
		}
	}
}

function quotedC(str) {

	str = str.replace('\\', '\\\\');
	str = str.replace('"', '\\"');

	return '"' + str + '"';
}

// Standard logos
const particle128x32 = '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000018000000000000000000000000000000180003fe000000000000006000000020380c03ffc0000003818000600000003838380383f0000003818000600000001e3c70038078000003818000600000000fbdf00380380000038000006000000007c7e0038018fe0c1bfd81f06078000007ffc003801bff8cfbfd87fc61ff000003ff8003801b83cfe3818f1f63c780003dfff803803800cf83819c0767038003feff7f83807000ef0381b8006e01c000fdff7f03ffe07fee0381b0006c00c00003ff8003ffc1ffec0381b0006fffc00003ffc0038007c0ec0381b0006fffc00007efe003800700ec0381b0006c0000000fbbe003800600ec0381b8006e0000001f3cf003800600ec0381b8026e0000001c383803800703ec01819e076701c00030381c038003ffec01fd8ffe63ff8000001800038001feec00fd83fc61ff0000001800000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

const particle32x32 = '00018000000180000001800000018000080180100603c0600703c0e003c3c3c001e3cf8001f99f8000fe7f0000fffe00007ffe00003ffc0007bffde0ffdffbffffdffbff07bffde0003ffc00007ffe0000fffe0000fe7f0001f99f8001e3cf8003c3c3c00703c0e00603c0600801801000018000000180000001800000018000';

const particle48x48 = '000001000000000001800000000001800000000001800000000001800000000003c00000000003c00000018003c0018001c003c0038000f007c00f00007807e01e00007e07e07e00003f07e0fc00001fc7e3f800001fe18ff800000ff81ff0000007fe7fe0000007ffffe0000003ffffc0000003ffff80000001ffff8000003cffff3c0007fcffff3fe0fffe7ffe7ffffffe7ffe7fff07fcffff3fe0003cffff3c000001ffff80000003ffff80000003ffffc0000007ffffe0000007fe7fe000000ff81ff000001fe18ff800001fc7e3f800003f07e0fc00007e07e07e00007807e01e0000f007c00f0001c003c00380018003c00180000003c00000000003c00000000001800000000001800000000001800000000001800000000001000000';

const adafruit82x64 = '00000000000180000000000000000000038000000000000000000007C000000000000000000007C00000000000000000000FC00000000000000000001FE00000000000000000001FE00000000000000000003FE00000000000000000003FF00000000000000000007FF0000000000000001FF87FF0000000000000003FFE7FF0000000000000003FFF7FF0000000000000001FFFFBE0000000000000000FFFF9FFC00000000000000FFFF9FFF800000000000007FFF1FFFF00000000000003FC73FFFF80000000000001FE3FFFFF80000000000000FF1E0FFF000000000000007FFE1FFC000000000000003FFFFFF8000000000000000FDFFFE0000000000000001F19FFC0000000000000003F3CFF00000000000000007E7CF800000000000000007FFE7C0000000000000000FFFFFC0000000000000000FFFFFE0000000000000000FFFFFE0000000000000001FFEFFE0000000000000001FFCFFE0000000000000003FF07FE0000000000000003FC07FE0000000000000003F003FE00000000000000018000FE000000000000000000007E000000000000000000003E000000000000000000000C000000000000078000FC000003C0000000078001FC000003C0000000078001FC000003C0000000078001E00000001E000000078001E00000001E007FE3F79FF9FDE7787BDFC0FFF7FFBFFDFDFF787BDFC0FFF7FFBFFDFDFF787BDFC0F0F787BC3DE1FF787BDE00F0F787BC3DE1F0787BDE0000F787803DE1E0787BDE007FF7879FFDE1E0787BDE00FFF787BFFDE1E0787BDE00F0F787BC3DE1E0787BDE00F0F787BC3DE1E0787BDE00F0F787BC3DE1E0787BDE00FFF7FFBFFDE1E07FFBDFC0FFF7FFBFFDE1E07FFBDFC07CF3F39F3DE1E03E7BCFC00000000000000000000000FFFFFFFFFFFFFFFFFFFFC0FFFFFFFFFD68DB111A31C0FFFFFFFFFD2B5AFB6AEFC0FFFFFFFFFD4B5B3B1A33C0FFFFFFFFFD6B5BDB6AFDC0';


const adafruit115x32 = '0000600000000000000000000000000000E00000000000000000000000000001E00000000000000000000000000001F00000000000000000000000000003F00000000000000000000000000007F00000000000000000000000000007F8000000000000000000000000000FF800000003C0007E000001E0007F0FF800000003C000FE000001E000FFEFF800000003C000FE000001E000FFFFF800000003C000F00000000F007FFE7FC0000003C000F00000000F003FFE7FF83FF1FBCFFCFEF3BC3DEFE01FFE7FFF7FFBFFDFFEFEFFBC3DEFE01FC6FFFF7FFBFFDFFEFEFFBC3DEFE00FE3C7FE787BC3DE1EF0FFBC3DEF0007FF87FC787BC3DE1EF0F83C3DEF0001FFFFF0007BC3C01EF0F03C3DEF0001F37FE03FFBC3CFFEF0F03C3DEF0003E33F807FFBC3DFFEF0F03C3DEF0007E73C00787BC3DE1EF0F03C3DEF0007FFBE00787BC3DE1EF0F03C3DEF0007FFFE00787BC3DE1EF0F03C3DEF000FFFFE007FFBFFDFFEF0F03FFDEFE00FFFFF007FFBFFDFFEF0F03FFDEFE00FF9FF003E79F9CF9EF0F01F3DE7E01FF1FF0000000000000000000000001F80FF007FFFFFFFFFFFFFFFFFFFE01C007F007FFFFFFFFEB46D888D18E000001F007FFFFFFFFE95AD7DB577E000000F007FFFFFFFFEA5AD9D8D19E0000006007FFFFFFFFEB5ADEDB57EE0';



