// ==UserScript==
// @name         Generals.io 1v1 match helper
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A tool for 1v1 to get stars
// @author       zzd233
// @match        https://generals.io/
// @grant        none
// ==/UserScript==
let abs = Math.abs, max = Math.max, min = Math.min;
function load(src) {
	return new Promise((resolve, reject) => {
		let c = document.createElement('script');
		c.src = src;
		c.addEventListener('load', resolve);
		c.addEventListener('error', reject);
		document.body.appendChild(c);
	});
}
let socket;
function waitConnect() {
	return new Promise((resolve, reject) => {
		socket.once('disconnect', reject);
		socket.once('connect', resolve);
	});
}
function clickButton(text) {
	Array.from(document.getElementsByTagName('button')).find(e => e.innerText.trim().toLowerCase() === text.toLowerCase().trim()).click();
}
async function load_elements(){
	let c = document.createElement("style");
	c.innerHTML = `
	body {
		background-color: #222;
	}

	#Sniper-all {
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		-khtml-user-select: none;
		user-select: none;
		z-index: 9999;
		position: absolute;
		top: 70px;
	}

	#Sniper-option, #Sniper-list {
		font-size: 20px;
		background-color: white;
		border: purple solid 5px;
		border-radius: 5px;
	}

	#Sniper-title {
		font-size: 24px;
		height: 30px;
		padding: 5px 10px 0px 10px;
		text-align: center;
	}

	#Sniper-option {
		margin-top: 5px;
		height: 230px;
		padding: 10px 10px 10px 10px;
	}

	#Sniper-range {
		border: black solid 4px;
		margin-bottom: 5px;
		padding: 5px 5px 5px 5px;
	}

	#Sniper-list {
		margin-top: 10px;
		font-size: 18px;
		height: 400px;
		padding: 10px 10px 10px 10px;
		overflow-y: scroll;
	}

	#Sniper-list-table {
		display: table;
	}

	.Sniper-button {
		border: black solid 3px;
		border-radius: 3px;
		background-color: red;
		height: 30px;
		width: 50px;
		text-align: center;
		color: white;
	}

	#Sniper-button4 {
		border: black solid 3px;
		border-radius: 3px;
		background-color: green;
		height: 30px;
		width: 85px;
		text-align: center;
		color: white;
	}

	#Sniper-enable_match, #Sniper-enable_leaderboard, #Sniper-enable_friends, #Sniper-new_friend, #Sniper-toggle_list {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	#Sniper-match-starbound {
		text-align: center;
		font-size: 15px;
		height: 30px;
		width: 45px;
	}

	#Sniper-new_friend {
		padding-top: 3px;
	}

	#Sniper-addfriend {
		text-align: center;
		font-size: 15px;
		height: 30px;
		width: 90px;
	}

	.Sniper-table_row {
		text_align: center;
		display: table-row;
	}

	.Sniper-table_cell {
		text_align: center;
		display: table-cell;
		border: black solid 1px;
		padding: 3px 3px 3px 3px;
	}

	.Sniper-header {
		background-color: #CCC;
	}

	.Sniper-friendcell {
		background-color: #BCF;
		color: black;
	}

	.Sniper-links {
		color: black;
	}

	#Sniper-titlelink {
		color: white;
		text-shadow: 2px 2px teal;
		font-family: Quicksand-Bold;
	}

	`;
	c.rel = "stylesheet";
	document.body.appendChild(c);
	let d = document.createElement("div");
	d.innerHTML = `
		<div id = "Sniper-all" hidden = "true">
			<div id = "Sniper-title">
				<a id = "Sniper-titlelink" href = "https://github.com/zzd233/Generals.io-1v1-match-helper" target = "_blank">Generals.io 1v1 match helper</a>
			</div>
			<div id = "Sniper-option">
				<div id = "Sniper-range">
					<div>
						Finding range:
					</div>
					<div id = "Sniper-enable_leaderboard">
						<div>
							&nbsp; Leaderboard: star ≥
						</div>
						<input id = "Sniper-match-starbound" placeholder = "inf"> &nbsp;
						<div class = "Sniper-button" id = "Sniper-button2">OFF</div>
					</div>
					<div id = "Sniper-enable_friends">
						<div>
							&nbsp; Friends: &nbsp;
						</div>
						<div class = "Sniper-button" id = "Sniper-button3">OFF</div>
					</div>
				</div>
				<div id = "Sniper-enable_match">
					<div>
						Auto Match:&nbsp;
					</div>
					<div class = "Sniper-button" id = "Sniper-button1">OFF</div>
				</div>
				<div id = "Sniper-new_friend">
					<div>
						Modify friend: &nbsp;
					</div>
					<input id = "Sniper-addfriend" placeholder = "someone"> &nbsp;
					<div id = "Sniper-button4">
						Add/Del
					</div>
				</div>
				<div id = "Sniper-toggle_list">
					<div>
						Show list: &nbsp;
					</div>
					<div class = "Sniper-button" id = "Sniper-toggle">ON</div>
				</div>
			</div>
			<div id = "Sniper-list">
				<div id = "Sniper-list-table">

				</div>
			</div>
		</div>
	`;
	document.body.appendChild(d);
}
let main_div, button1, button2, button3, button4, option_element, list_element, toggle;
let match_starbound, addfriend;
let list_table;
let enable_match = false;
let enable_leaderboard = false;
let enable_friends = false;
let friend_list = [];
const Eps = 1e-3;
let myname = undefined;
let data = {};//store other's star and last 1v1 game time; example: data["zzd233"] = {star: 70.00, time: 1617360510077}
let friend_dictionary = {};
function px2int(s){
	return parseInt(s.substr(0, s.length - 2));
}
function int2px(a){
	return `${a}px`;
}
function load_drag(box, callback = () => {}){
	let isdrag = false, x, y;
	box.onmousedown = (event) => {
		event = event || window.event;
		x = event.clientX;
		y = event.clientY;
		isdrag = true;
	}
	box.onmousemove = (event) => {
		if (!isdrag)
			return;
		// console.log(event.button);
		event = event || window.event;
		let dx = event.clientX - x;
		let dy = event.clientY - y;
		x = event.clientX;
		y = event.clientY;
		let nx = px2int(box.style.right) - dx;
		let ny = px2int(box.style.top) + dy;
		nx = max(20 - box.offsetWidth, min(nx, document.body.offsetWidth - 20));
		ny = max(20 - box.offsetHeight, min(ny, document.body.offsetHeight - 20));
		box.style.right = int2px(nx);
		box.style.top = int2px(ny);
		callback();
	}
	box.onmouseup = (event) => {
		isdrag = false;
	}
}
function main(){
	setTimeout(async () => {
		let lib_socket = 'https://cdn.jsdelivr.net/npm/socket.io-client@2/dist/socket.io.js';
		let lib_jquery = 'https://code.jquery.com/jquery-3.6.0.min.js';
		await load(lib_socket);
		await load(lib_jquery);
		await load_elements();
		socket = io('https://ws.generals.io');
		await waitConnect();
		console.log('connected');
		function get_myname(){
			let tmp = document.getElementById('main-menu-username-input');
			if (tmp)
				myname = tmp.value;
		}
		get_myname();
		main_div = document.getElementById('Sniper-all');
		let local_main_div_position = JSON.parse(localStorage.getItem("zzdscript_main_div_position"));
		if (!local_main_div_position){
			local_main_div_position = {x: 80, y: 70};
			localStorage.setItem("zzdscript_main_div_position", JSON.stringify(local_main_div_position));
		}
		main_div.style.right = int2px(local_main_div_position.x);
		main_div.style.top = int2px(local_main_div_position.y);
		load_drag(main_div, () => {
			localStorage.setItem("zzdscript_main_div_position", JSON.stringify({
				x: px2int(main_div.style.right),
				y: px2int(main_div.style.top),
			}));
		});
		button1 = document.getElementById('Sniper-button1');
		button2 = document.getElementById('Sniper-button2');
		button3 = document.getElementById('Sniper-button3');
		button4 = document.getElementById('Sniper-button4');
		toggle = document.getElementById('Sniper-toggle');
		option_element = document.getElementById('Sniper-option');
		list_element = document.getElementById('Sniper-list');
		toggle.style.backgroundColor = "green";
		if(window.localStorage["QUEUE_SNIPER_HIDE_LIST"] == "hide") {
			toggle.textContent = "OFF";
			list_element.style.display = "none";
			toggle.style.backgroundColor = "red";
		}
		toggle.addEventListener('click', () => {
			if(window.localStorage["QUEUE_SNIPER_HIDE_LIST"] == "hide") {
				window.localStorage["QUEUE_SNIPER_HIDE_LIST"] = "show";
				toggle.textContent = "ON";
				list_element.style.display = "";
				toggle.style.backgroundColor = "green";
			} else {
				window.localStorage["QUEUE_SNIPER_HIDE_LIST"] = "hide";
				toggle.textContent = "OFF";
				list_element.style.display = "none";
				toggle.style.backgroundColor = "red";
			}
		});
		match_starbound = document.getElementById("Sniper-match-starbound");
		addfriend = document.getElementById("Sniper-addfriend");
		list_table = document.getElementById("Sniper-list-table");
		let settings = JSON.parse(localStorage.getItem("zzdscript_settings"));
		if (!settings){
			settings = [enable_match, enable_leaderboard, enable_friends, "50"];
			localStorage.setItem('zzdscript_settings',JSON.stringify(settings));
		}
		[enable_match, enable_leaderboard, enable_friends, match_starbound.value] = settings;
		if (enable_match){
			button1.innerHTML = "ON";
			button1.style.backgroundColor = "green";
		} else {
			button1.innerHTML = "OFF";
			button1.style.backgroundColor = "red";
		}
		if (enable_leaderboard){
			button2.innerHTML = "ON";
			button2.style.backgroundColor = "green";
		} else {
			button2.innerHTML = "OFF";
			button2.style.backgroundColor = "red";
		}
		if (enable_friends){
			button3.innerHTML = "ON";
			button3.style.backgroundColor = "green";
		} else {
			button3.innerHTML = "OFF";
			button3.style.backgroundColor = "red";
		}
		friend_list = JSON.parse(localStorage.getItem("zzdscript_Friends"));
		if (!friend_list){
			friend_list = [];
			localStorage.setItem("zzdscript_Friends", JSON.stringify(friend_list));
		}
		for (let name of friend_list)
			friend_dictionary[name] = true;
		button1.addEventListener('click', () => {
			if (button1.innerHTML === "OFF"){
				button1.innerHTML = "ON";
				button1.style.backgroundColor = "green";
				enable_match = true;
			} else {
				button1.innerHTML = "OFF";
				button1.style.backgroundColor = "red";
				enable_match = false;
			}
			settings = [enable_match, enable_leaderboard, enable_friends, match_starbound.value];
			localStorage.setItem('zzdscript_settings',JSON.stringify(settings));
		});
		button2.addEventListener('click', () => {
			if (button2.innerHTML === "OFF"){
				button2.innerHTML = "ON";
				button2.style.backgroundColor = "green";
				enable_leaderboard = true;
			} else {
				button2.innerHTML = "OFF";
				button2.style.backgroundColor = "red";
				enable_leaderboard = false;
			}
			settings = [enable_match, enable_leaderboard, enable_friends, match_starbound.value];
			localStorage.setItem('zzdscript_settings',JSON.stringify(settings));
		});
		button3.addEventListener('click', () => {
			if (button3.innerHTML === "OFF"){
				button3.innerHTML = "ON";
				button3.style.backgroundColor = "green";
				enable_friends = true;
			} else {
				button3.innerHTML = "OFF";
				button3.style.backgroundColor = "red";
				enable_friends = false;
			}
			settings = [enable_match, enable_leaderboard, enable_friends, match_starbound.value];
			localStorage.setItem('zzdscript_settings',JSON.stringify(settings));
		});
		button4.addEventListener('click', () => {
			let name = addfriend.value.trim();
			if (name.length === 0)
				return;
			let index = friend_list.findIndex(x => x === name);
			if (index === -1){
				friend_list.push(name);
				friend_dictionary[name] = true;
			} else {
				friend_list.splice(index,1);
				friend_dictionary[name] = undefined;
			}
			addfriend.value = "";
			localStorage.setItem("zzdscript_Friends", JSON.stringify(friend_list));
		});
		let leaderboard_initialized = false, leaderboard_cnt = 0;
		let NOREPLAY = "";
		let ONEVONE = "1v1";
		let FFA = "FFA";
		let TWOVTWO = "2v2";
		let CUSTOM = "custom";
		let time_delta = 0;
		let real_time = Number(new Date($.ajax({async:false}).getResponseHeader("Date")));
		let system_time = Number(new Date());
		time_delta = real_time - system_time;
		console.log(`time_delta = `, time_delta);
        setInterval(async () => {
            let buttons = Array.from(document.getElementsByTagName('button')).map(a => a.innerHTML);
			if (!buttons.find(a => a === "PLAY" || a === "1v1" || a === "Play Again" || a === "Cancel")){
				main_div.hidden = true;
			}
        }, 100);
		let tasks = 0, time_0 = undefined, friend_list_loaded = false;
		let players_from_leaderboard, bound;
		let count_tasks_n0 = 0, last_tasks = -1;
		let main_interval = setInterval(async () => {
			if (tasks !== 0 && last_tasks === tasks)
				count_tasks_n0 ++;
			else
				count_tasks_n0 = 0;
			if (count_tasks_n0 > 500) {
				// clearInterval(main_interval);
				tasks = count_tasks_n0 = 0;
			}
			last_tasks = tasks;
			// console.log(tasks);
			if (tasks < 0) {
				clearInterval(main_interval);
				throw "tasks < 0";
			}
			if (tasks > 0)
				return;
			if (time_0 !== undefined){
				let now = Number(new Date()) + time_delta;
				if (now - time_0 > 1500)
					console.log(new Date(), `fetch: time = ${now - time_0}`);
				let pool = [];
				if (enable_friends)
					for (let name of friend_list){
						pool.push({
							name: name,
							star: data[name].star,
							time_past: isNaN(data[name].time) ? NaN : now - data[name].time,
							isfriend: true,
							type: data[name].type,
						});
					}
				if (enable_leaderboard){
					for (let name of players_from_leaderboard){
						if (!name)
							continue;
						if ((friend_dictionary[name] === true && enable_friends) || !data[name] || !(data[name].star > bound) || name === myname)
							continue;
						if (isNaN(data[name].time) || now - data[name].time > 1000 * 60 * 30)
							continue;
						pool.push({
							name: name,
							star: data[name].star,
							time_past: isNaN(data[name].time) ? NaN : now - data[name].time,
							isfriend: false,
							type: data[name].type,
						});
					}
				}
				pool.sort((a, b) => {
					let [x, y] = [a.time_past, b.time_past];
					if (isNaN(x) && isNaN(y)) {
						return b.star - a.star;
					}
					if (isNaN(x) !== isNaN(y))
						return isNaN(x) ? 1 : -1;
					return x - y;
				});
				let htmlstring = `
					<div class = "Sniper-table_row">
						<div class = "Sniper-table_cell Sniper-header">
							name
						</div>
						<div class = "Sniper-table_cell Sniper-header">
							star
						</div>
						<div class = "Sniper-table_cell Sniper-header">
							last
						</div>
					</div>
				`;
				function time_past_to_string(t){
					if (isNaN(t))
						return "";
					t = Math.floor(t / 1000);
					if (t < 60)
						return `${t}s`;
					else if (t < 3600)
						return `${Math.floor(t/60)}m`;
					else
						return `${(t/3600).toFixed(1)}h`;
				}
				for (let user of pool){
					htmlstring += `
						<div class = "Sniper-table_row">
							<div class = "Sniper-table_cell ${user.isfriend ? "Sniper-friendcell" : ""}">
								<a class = "Sniper-links" href = "https://generals.io/profiles/${encodeURIComponent(user.name)}" target = "_blank">${user.name}</a>
							</div>
							<div class = "Sniper-table_cell ${user.isfriend ? "Sniper-friendcell" : ""}">
								${user.star}
							</div>
							<div class = "Sniper-table_cell ${user.isfriend ? "Sniper-friendcell" : ""}">
								${isNaN(user.time_past) ? user.type : time_past_to_string(user.time_past)}
							</div>
						</div>
					`;
				}
				list_table.innerHTML = htmlstring;
				if (enable_match && pool.length > 0){
					let t = pool[0];
					if (t.time_past < 8000){
						console.log("join 1v1!");
						try { clickButton('play'); } catch (e) { }
						try { clickButton('1v1'); } catch (e) { }
						try { clickButton('play again'); } catch (e) { }
						button1.innerHTML = "OFF";
						button1.style.backgroundColor = "red";
						enable_match = false;
						setTimeout(() => {
							try {
								clickButton('cancel');
								button1.innerHTML = "ON";
								button1.style.backgroundColor = "green";
								enable_match = true;
							} catch (e){}
						}, 8000);
					}
				}
			}
			let buttons = Array.from(document.getElementsByTagName('button')).map(a => a.innerHTML);
			if (!buttons.find(a => a === "PLAY" || a === "1v1" || a === "Play Again" || a === "Cancel")){
				main_div.hidden = true;
				time_0 = undefined;
				return;
			}
			main_div.hidden = false;
			time_0 = Number(new Date()) + time_delta;
			get_myname();
			function update_player(name, current_star){
				if (data[name] != undefined && abs(current_star - data[name].star) < 0.01)
					return;
				else {
					// console.log("name = ",name,"star = ",current_star, data[name]);
					tasks+=100;
					let task_id = Number(new Date())%100000;
					// console.log(`+${task_id}, ${tasks}`);
					let url = 'https://generals.io/api/replaysForUsername?u=' + encodeURIComponent(name) + '&offset=0&count=1';
					fetch(url).then(tmp => {
						return tmp.json();
					}).then(tmp => {
						if (!tmp || !tmp.length){
							data[name] = {star: 0, time: NaN, type: NOREPLAY};
							// throw "cant find any replays for user " + name;
						} else {
							tmp = tmp[0];
							data[name] = {star: current_star, time: tmp.type === '1v1' ? tmp.started + (tmp.turns - 1) * 500 : NaN};
							if (tmp.type === '1v1')
								data[name].type = ONEVONE;
							else if (tmp.type === '2v2')
								data[name].type = TWOVTWO;
							else if (tmp.type === 'classic')
								data[name].type = FFA;
							else if (tmp.type === 'custom')
								data[name].type = CUSTOM;
						}
						tasks-=100;
						// console.log(`-${task_id}, ${tasks}`);
					});
				}
			}
			settings = [enable_match, enable_leaderboard, enable_friends, match_starbound.value];
			localStorage.setItem('zzdscript_settings',JSON.stringify(settings));
			bound = parseFloat(match_starbound.value);
			if (isNaN(bound))
				bound = Infinity;
			bound -= Eps;
			players_from_leaderboard = [];
			tasks+=10000;
			let task_id = Number(new Date())%100000;
			// console.log(`+${task_id}, ${tasks}`);
			socket.emit('leaderboard', 'duel', (res) => {
				// console.log(res);
				let stars = res.stars, users = res.users;
				if (enable_friends || !friend_list_loaded){
					friend_list_loaded = true;
					for (let name of friend_list){
						let index = users.findIndex(x => x === name);
						if (index === -1){
							tasks++;
							let task_id = Number(new Date())%100000;
							// console.log(`+${task_id}, ${tasks}`);
							let url = 'https://generals.io/api/starsAndRanks?u=' + encodeURIComponent(name);
							fetch(url).then(tmp => {
								return tmp.json();
							}).then(tmp => {
								let star = parseFloat(tmp.stars.duel).toFixed(2);
								if (isNaN(star))
									star = 0;
								update_player(name, star);
								tasks--;
								// console.log(`-${task_id}, ${tasks}`);
							});
						} else {
							update_player(name, parseFloat(stars[index]).toFixed(2));
						}
					}
				}
				if (enable_leaderboard){
					players_from_leaderboard = users;
					if (!leaderboard_initialized){
						leaderboard_initialized = true;
						for (let i = 0; i < stars.length; i++){
							if (!users[i])
								continue;
							if (!data[users[i]]){
								if (friend_dictionary[users[i]])
									update_player(users[i],parseFloat(stars[i]).toFixed(2));
								else
									data[users[i]] = {star: parseFloat(stars[i]).toFixed(2), time: NaN, type: NOREPLAY};
							}
						}
					} else {
						const step = 2;
						leaderboard_cnt += step;
						for (let i = 0; i < stars.length; i++) {
							if (users[i] && (friend_dictionary[users[i]] !== true || !enable_friends)){
								if (leaderboard_cnt - step <= i && i < leaderboard_cnt)
									data[users[i]] = undefined;
								update_player(users[i], parseFloat(stars[i]).toFixed(2));
							}
						}
					}
				}
				tasks-=10000;
				// console.log(`-${task_id}, ${tasks}`);
			});
		}, 100);
	}, 1000);
};

let checkready = setInterval(() => {
	if (document.readyState === "complete"){
		main();
		clearInterval(checkready);
	}
}, 250);
