const state = {};
function main(){
   state.view = document.getElementById("view")
   state.pen = state.view.getContext("2d");
   state.cells = genCells(state.view.width,state.view.height);
   state.view.onclick = toggleCell;
   draw();
}
function toggleCell(evt){
   const xper = 0;
   const yper = 0;
   const x = evt.x / xper;
   const y = evt.y / yper;
   state.cells[x][y] = !state.cells[x][y];
}
function genCells(w, h){
   let cells = new Array(w);
   for(let i = 0; i < h; i++){
      cells[i] = new Array(h);
      for(let j = 0; j < h; j++){
         cells[i][j] = false;
      }
   }
   return cells
}
function gol(){
   draw()
   update()
}
function getPdim(x,y){
   const dims = {};
   const ppcx = state.view.offsetWidth/state.view.width;
   const ppcy = state.view.offsetHeight/state.view.height;
   dims.w = ppcx
   dims.h = ppcy
   return dims
}
function drawCell(x,y){
   pdim = getPdim(x,y);
   state.pen.fillRect(x,y,pdim.w,pdim.h);
}
function draw(){
   for(let x = 0; x < state.cells.length; x++){
      for(let y = 0; y < state.cells[0].length; y++){
         if(state.cells[x][y]){
            drawCell(x,y);
         }
      }
   }
   setTimeout(draw, 1000/60);
}
function update(){

}
