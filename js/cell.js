var Cell = function () {
  this.neighbors = parseInt(0);
  this.alive = parseInt(0);
};

var cells = new Array();

for (var i = 0; i < cells.length; i++) {
	cells[i] = new Cell();
}