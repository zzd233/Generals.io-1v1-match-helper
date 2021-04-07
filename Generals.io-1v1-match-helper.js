// ==UserScript==
// @name         Generals.io 1v1 match helper
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A tool for 1v1 to get stars
// @author       zzd233
// @match        http://generals.io/
// @grant        none
// ==/UserScript==
let abs = Math.abs;
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
	
	#option, #list{
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		-khtml-user-select: none;
		user-select: none;
		font-size: 20px;
		background-color: white;
		border: purple solid 5px;
		border-radius: 5px;
		position: absolute;
	}

	#title {
		position: absolute;
		font-size: 24px;
		right: 80px;
		top: 70px;
		width: 350px;
		height: 30px;
		padding: 5px 10px 0px 10px;
	}

	#option {
		right: 80px;
		top: 110px;
		width: 350px;
		height: 200px;
		padding: 10px 10px 10px 10px;
	}
	
	#range {
		border: black solid 4px;
		margin-bottom: 5px;
		padding: 5px 5px 5px 5px;
	}
	
	#list {
		font-size: 18px;
		right: 80px;
		top: 350px;
		width: 350px;
		height: 400px;
		padding: 10px 10px 10px 10px;
		overflow-y: scroll;
	}
	
	#list-table {
		display: table;
	}
	
	.button {
		border: black solid 3px;
		border-radius: 3px;
		background-color: red;
		height: 30px;
		width: 50px;
		text-align: center;
		color: white;
	}
	
	#button4 {
		border: black solid 3px;
		border-radius: 3px;
		background-color: green;
		height: 30px;
		width: 85px;
		text-align: center;
		color: white;
	}
	
	#enable_match, #enable_leaderboard, #enable_friends, #new_friend {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	
	#match-starbound {
		text-align: center;
		font-size: 15px;
		height: 30px;
		width: 45px;
	}
	
	#new_friend {
		padding-top: 3px;
	}
	
	#addfriend {
		text-align: center;
		font-size: 15px;
		height: 30px;
		width: 90px;
	}

	.table_row {
		text_align: center;
		display: table-row;
	}
	
	.table_cell {
		text_align: center;
		display: table-cell;
		border: black solid 1px;
		padding: 3px 3px 3px 3px;
	}

	.header {
		background-color: #CCC;
	}

	.friendcell {
		background-color: #BCF;
		color: black;
	}

	.links {
		color: black;
	}

	#titlelink {
		color: white;
		text-shadow: 2px 2px teal;
		font-family: Quicksand-Bold;
	}
	
	`;
	c.rel = "stylesheet";
	document.body.appendChild(c);
	let d = document.createElement("div");
	d.innerHTML = `
		<div id = "all">
			<div id = "title">
				<a id = "titlelink" href = "https://github.com/zzd233/Generals.io-1v1-match-helper" target = "_blank">Generals.io 1v1 match helper</a>
			</div>
			<div id = "option">
				<div id = "range">
					<div>
						Finding range:
					</div>
					<div id = "enable_leaderboard">
						<div>
							&nbsp; Leaderboard: star ≥
						</div>
						<input id = "match-starbound" placeholder = "inf"> &nbsp;
						<div class = "button" id = "button2">OFF</div>
					</div>
					<div id = "enable_friends">
						<div>
							&nbsp; Friends: &nbsp;
						</div>
						<div class = "button" id = "button3">OFF</div>
					</div>
				</div>
				<div id = "enable_match">
					<div>
						Auto Match:&nbsp;
					</div>
					<div class = "button" id = "button1">OFF</div>
				</div>
				<div id = "new_friend">
					<div>
						Modify friend: &nbsp;
					</div>
					<input id = "addfriend" placeholder = "someone"> &nbsp;
					<div id = "button4">
						Add/Del
					</div>
				</div>
			</div>
			<div id = "list">
				<div id = "list-table">
					
				</div>
			</div>
		</div>
	`;
	document.body.appendChild(d);
}
let button1, button2, button3, button4, option_element, list_element;
let match_starbound, addfriend;
let list_table;
let enable_match = false;
let enable_leaderboard = false;
let enable_friends = false;
let friend_list = [];
const INTERVAL = 3000, Eps = 1e-3;
let myname;
let data = {};//store other's star and last 1v1 game time; example: data["zzd233"] = {star: 70.00, time: 1617360510077} 
let friend_dictionary = {};
let main = () => {
	setTimeout(async () => {
		let lib_socket = 'https://cdn.jsdelivr.net/npm/socket.io-client@2/dist/socket.io.js';
		await load(lib_socket);
		await load_elements();
		socket = io('http://ws.generals.io');
		await waitConnect();
		console.log('connected');
		function get_myname(){
			let tmp = document.getElementById('main-menu-username-input');
			if (!tmp)
				return undefined;
			else
				return tmp.value;
		}
		myname = get_myname();
		button1 = document.getElementById('button1');
		button2 = document.getElementById('button2');
		button3 = document.getElementById('button3');
		button4 = document.getElementById('button4');
		option_element = document.getElementById('option');
		list_element = document.getElementById('list');
		match_starbound = document.getElementById("match-starbound");
		addfriend = document.getElementById("addfriend");
		list_table = document.getElementById("list-table");
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
		let leaderboard_initialized = false;
		setInterval(async () => {
			let buttons = Array.from(document.getElementsByTagName('button')).map(a => a.innerHTML);
			if (!buttons.find(a => a === "PLAY" || a === "1v1" || a === "Play Again" || a === "Cancel")){
				document.getElementById("all").hidden = true;
				return;
			}
			document.getElementById("all").hidden = false;
			myname = get_myname();
			let tasks = 0;
			async function update_player(name, current_star){
				if (data[name] != undefined && abs(current_star - data[name].star) < 0.01)
					return;
				else {
					console.log("name = ",name,"star = ",current_star, data[name]);
					tasks++;
					let url = 'http://generals.io/api/replaysForUsername?u=' + encodeURIComponent(name) + '&offset=0&count=1';
					fetch(url).then(tmp => {
						return tmp.json();
					}).then(tmp => {
						if (!tmp || !tmp.length){
							data[name] = {star: 0, time: NaN};
							// throw "cant find any replays for user " + name;
						} else {
							tmp = tmp[0];
							data[name] = {star: current_star, time: tmp.type === '1v1' ? tmp.started + (tmp.turns - 1) * 500 : NaN};
						}
						tasks--;
					});
				}
			}
			settings = [enable_match, enable_leaderboard, enable_friends, match_starbound.value];
			localStorage.setItem('zzdscript_settings',JSON.stringify(settings));
			let bound = parseFloat(match_starbound.value);
			if (isNaN(bound))
				bound = Infinity;
			bound -= Eps;
			let players_from_leaderboard = [];
			tasks++;
			socket.emit('leaderboard', 'duel', (res) => {
				// console.log(res);
				let stars = res.stars, users = res.users;
				if (enable_friends){
					for (let name of friend_list){
						let index = users.findIndex(x => x === name);
						if (index === -1){
							tasks++;
							let url = 'http://generals.io/api/starsAndRanks?u=' + encodeURIComponent(name);
							fetch(url).then(tmp => {
								return tmp.json();
							}).then(tmp => {
								let star = parseFloat(tmp.stars.duel).toFixed(2);
								if (isNaN(star))
									star = 0;
								update_player(name, star);
								tasks--;
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
									data[users[i]] = {star: parseFloat(stars[i]).toFixed(2), time: NaN};
							}
						}
						tasks--;
						return;
					}
					for (let i = 0; i < stars.length; i++) {
						if (users[i] && stars[i] > bound && (friend_dictionary[users[i]] !== true || !enable_friends)){
							update_player(users[i], parseFloat(stars[i]).toFixed(2));
						}
					}
				}
				tasks--;
			});
			let time_0 = Number(new Date());
			let checkfetchendinterval = setInterval(()=>{
				if (tasks == 0){
					clearInterval(checkfetchendinterval);
					let now = Number(new Date());
					console.log(`fetch: time = ${now - time_0}`);
					let pool = [];
					if (enable_friends)
						for (let name of friend_list){
							pool.push({
								name: name,
								star: data[name].star,
								time_past: isNaN(data[name].time) ? NaN : now - data[name].time,
								isfriend: true,
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
							});
						}
					}
					pool.sort((a, b) => {
						let [x, y] = [a.time_past, b.time_past];
						if (isNaN(x) && isNaN(y))
							return 0;
						if (isNaN(x) !== isNaN(y))
							return isNaN(x) ? 1 : -1;
						return x - y;
					});
					let htmlstring = `
						<div class = "table_row">
							<div class = "table_cell header">
								name
							</div>
							<div class = "table_cell header">
								star
							</div>
							<div class = "table_cell header">
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
							<div class = "table_row">
								<div class = "table_cell ${user.isfriend ? "friendcell" : ""}">
									<a class = "links" href = "http://generals.io/profiles/${encodeURIComponent(user.name)}" target = "_blank">${user.name}</a>
								</div>
								<div class = "table_cell ${user.isfriend ? "friendcell" : ""}">
									${user.star}
								</div>
								<div class = "table_cell ${user.isfriend ? "friendcell" : ""}">
									${time_past_to_string(user.time_past)}
								</div>
							</div>
						`;
					}
					list_table.innerHTML = htmlstring;
					if (enable_match && pool.length > 0){
						let t = pool[0];
						if (t.time_past < INTERVAL + 7000){
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
							}, 10000);
						}
					}
					return;
				}
			}, 333);
		}, INTERVAL);
	}, 1000);
};

let checkready = setInterval(() => {
	if (document.readyState === "complete"){
		main();
		clearInterval(checkready);
	}
}, 250);
