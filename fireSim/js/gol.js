const state = {}
const MAX_AGE = 5
function main(){
   state.view = document.getElementById("view");
   state.pen = state.view.getContext("2d");
   state.dims = getDims();
   state.cells = genCells();
   state.ups = document.getElementById("ups");
   state.running = true;
   state.view.onclick = toggleCell;
   draw();
   update();
}
function getData(){
   fetch("./out.json").then(resp => resp.json()).then(json => state.tif = json).then(() => main());
}
function getDims(){
   return [state.view.getAttribute("xcells"),
           state.view.getAttribute("ycells")]
}
function toggleRunning(){
   if(state.running){
      state.running = false;
      return;
   }
   state.running = true;
   update();
}
function update(){
   if(!state.running){
      return;
   }
   const newCells = genCells();
   for(let x = 0; x < state.cells.length; x++){
      for(let y = 0; y < state.cells[0].length; y++){
         newCells[x][y] = updateCell(x,y);
      }
   }
   state.cells = newCells;
   setTimeout(update, 0 * state.ups.value);
}
function countNear(x,y){
   let total = 0;
   let cx = x - 1;
   let cy = y - 1;
   if(state.cells[x][y].type != "normal"){
      return 0;
   }
   for(let i = 0; i < 3; i++){
      for(let j = 0; j < 3; j++){
         if(j == 1 && i == 1) continue; //ignore yourself...
         if((cx + i) < 0 || 
            (cy + j) < 0 || 
            (cx + i) >= state.cells.length ||
            (cy + j) >= state.cells.length) continue; // ignore out of bounds
         if(state.cells[cx + i][cy + j].type == "fire" && state.cells[cx + i][cy + j].age <= MAX_AGE){
            total++; 
         }
      }
   }
   return total;
}
function newFire(elevation){
   return {type : "fire", elevation : elevation, age : 0}
}
function updateCellOld(x,y){
   const near = countNear(x,y);
   if(state.cells[x][y].type == "fire"){
      state.cells[x][y].age = state.cells[x][y].age + 1;
   }
   if(near >= 1 && parseInt(Math.random() * 10) + near > 8){
      return newFire(state.cells[x][y].elevation); 
   }
   return state.cells[x][y];
}
function findProb(x,y){
   const me = state.cells[x][y];
   let total = 0;
   if(me.type == "break"){
      return total;
   }
   let cx = x - 1;
   let cy = y - 1;
   for(let i = 0; i < 3; i++){
      for(let j = 0; j < 3; j++){
         if(j == 1 && i == 1) continue; //ignore yourself...
         if((cx + i) < 0 || 
            (cy + j) < 0 || 
            (cx + i) >= state.cells.length ||
            (cy + j) >= state.cells.length) continue; // ignore out of bounds
         if(state.cells[cx + i][cy + j].type == "fire" && state.cells[cx + i][cy + j].age <= MAX_AGE){
            contribution = 12.5
            const myel = me.elevation;
            const theirel = state.cells[cx + i][cy + j].elevation;
            if(myel > theirel){
               //total+=5;
            }
            if(myel < theirel){
               total-=5;
            }
            total+=contribution;
         }
      }
   }
   return total;
}
function updateCell(x,y){
   if(state.cells[x][y].type == "fire"){
      state.cells[x][y].age = state.cells[x][y].age + 1;
      return state.cells[x][y];
   }
   const prob = findProb(x,y);
   if(prob >= 100 * Math.random()){
      return newFire(state.cells[x][y].elevation);   
   }
   return state.cells[x][y]
}
function normalize(v, n){
   let per = v / n
   return per * 255;
}
function genCells(){
   const w = state.dims[0];
   const h = state.dims[1];
   let cells = new Array(w);
   for(let i = 0; i < h; i++){
      cells[i] = new Array(h);
      for(let j = 0; j < h; j++){
         try{
            cells[i][j] = {type:"normal",elevation:normalize(state.tif[i][j], 2000)};
         }catch(e){
            cells[i][j] = {type: "break", elevation : 0}
         }
      }
   }
   return cells
}
function genCellsold(){
   const sel = parseInt(Math.random() * 255);
   const w = state.dims[0];
   const h = state.dims[1];
   let cells = new Array(w);
   for(let i = 0; i < h; i++){
      cells[i] = new Array(h);
      for(let j = 0; j < h; j++){
         let curEl = 0;
         if(i == 0 && j == 0){
            curEl = sel;
         } else if(i == 0){
            curEl = cells[i][j-1].elevation;
         } else if(j == 0){
            curEl = cells[i-1][j].elevation;
         } else {
            curEl = (cells[i-1][j-1].elevation + cells[i-1][j].elevation + cells[i][j-1].elevation) / 3;
         }
         let delta = parseInt(Math.random() * 25);
         delta = Math.random() > .5 ? delta : delta * -1;
         curEl += delta;
         if(curEl>=255){
            curEl -= 2 * delta;
         }
         if(curEl <= 0){
            curEl += delta * 2;
         }
         cells[i][j] = {type:"normal",elevation:curEl};
      }
   }
   return cells
}
function drawCell(x,y){
   const xper = state.view.width / state.dims[0];
   const yper = state.view.height / state.dims[1];
   const c = state.cells[x][y];
   state.pen.fillStyle = "rgb("+c.elevation+","+c.elevation+","+c.elevation+")";
   if(c.type == "fire"){
      state.pen.fillStyle = "rgb(255,0,0)";
      if(c.age >= MAX_AGE){
         state.pen.fillStyle = "rgb(255,0,255)";
      }
   }
   if(c.type == "break"){
      state.pen.fillStyle = "rgb(255,255,0)";
   }
   state.pen.fillRect(x * xper, y * yper,
      state.view.width/state.dims[0],
      state.view.height/state.dims[1]);
}
function drawGrid(){
   for(let x = 0; x <= state.view.width; x+=(state.view.width/state.dims[0])){
      state.pen.beginPath();
      state.pen.moveTo(x,0);
      state.pen.lineTo(x,state.view.height);
      state.pen.stroke();
   }
   for(let y = 0; y <= state.view.height; y+=(state.view.height/state.dims[1])){
      state.pen.beginPath();
      state.pen.moveTo(0,y);
      state.pen.lineTo(state.view.width,y);
      state.pen.stroke();
   }
}
function draw(){
   state.pen.clearRect(0,0,state.view.width,state.view.height)
   drawGrid();
   for(let x = 0; x < state.cells.length; x++){
      for(let y = 0; y < state.cells[0].length; y++){
         drawCell(x,y);
      }
   }
   setTimeout(draw, 10);
}
function evtToLoc(evt){
   return [parseInt(evt.x/(state.view.offsetWidth) * (state.dims[0])), 
           parseInt(evt.y/(state.view.offsetHeight) * (state.dims[1]))]
}
function toggleCell(evt){
   const loc = evtToLoc(evt);
   const x = loc[0]
   const y = loc[1]
   if(state.cells[x][y].type == "fire"){
      state.cells[x][y].type = "break";
   } else {
      state.cells[x][y] = newFire(state.cells[x][y].elevation);
   }
}
