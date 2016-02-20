var Cell = function () {
  this.neighbors = 0;
  this.alive = 0;
};

var cells = new Array();

for (var i = 0; i < cells.length; i++) {
	cells[i] = new Cell();
}