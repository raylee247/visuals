var sorting = (function() {

  var DEFAULT_COLOR = '#777';
  var COMPARE_COLOR = '#00f';
  var SWAP_COLOR = '#f00';

 //CREDIT for draw array, http://cs.stanford.edu/people/jcjohns/sorting.js/
 //removed features from animated array to practice sorting types
  function draw_array(canvas, ary, colors) {
    /*
     * Draw an array on a canvas.
     *
     * Inputs:
     * - canvas: a DOM canvas object
     * - ary: An array of numbers to draw
     * - colors: An array of the same length as ary, whose ith element
     *   is a string giving the color for the ith element of ary
     */
    var width_ratio = 2;
    var ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Find min and max elements
    var min = ary[0];
    var max = ary[0];
    for (var i = 1; i < ary.length; i++) {
      min = ary[i] < min ? ary[i] : min;
      max = ary[i] > max ? ary[i] : max;
    }

    // Figure out width of bars and spacing
    var n = ary.length;
    var spacing = canvas.width / (width_ratio * n + n + 1);
    var bar_width = spacing * width_ratio;

    // Draw a box around the outside of the canvas
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    function convert_y(y) {
      // Want convert_y(max) = 0, convert_y(min) = canvas.height`
      var a = canvas.height / (min - max);
      var b = max * canvas.height / (max - min);
      return a * y + b;
    }

    // Draw a baseline for zero
    var y_zero = convert_y(0);
    ctx.beginPath();
    ctx.moveTo(0, y_zero);
    ctx.lineTo(canvas.width, y_zero);
    ctx.stroke();

    // Now draw boxes
    var x = spacing;
    for (var i = 0; i < ary.length; i++) {
      ctx.fillStyle = colors[i];
      var y = convert_y(ary[i]);
      if (ary[i] >= 0) {
        ctx.fillRect(x, y, bar_width, y_zero - y);
      } else {
        ctx.fillRect(x, y_zero, bar_width, y - y_zero);
      }
      x += spacing + bar_width;
    }
  }

  function AnimatedArray(ary, canvas, interval) {
    /*
     * An AnimatedArray wraps a pure Javascript array of numbers,
     * and provides functions to compare and swap elements of the array.
     * These comparisons and swaps will be visualized on a canvas.
     *
     * The AnimatedArray stores two copies of the array and a list of actions;
     * whenever one of the comparison or swap methods are called, the original
     * array is immediately updated and the action is added to the action list;
     * whenever _step() is called (which you should not call manually), one
     * action is consumed from the action list, the second copy of the array
     * is updated if needed, an the array is drawn to the canvas.
     *
     * This design lets clients of AnimatedArray use it in clean imperative
     * code without worrying about callbacks. The downside is that it uses
     * extra memory.
     *
     * Inputs to the constructor:
     * - ary: Pure Javascript array to wrap
     * - canvas: DOM canvas object where we will draw
     * - interval: Time (in milliseconds) between visualizing each step
     */
    this._ary = ary;
    this._canvas = canvas;
    this._ary_display = [];
    this._colors = [];
    this._actions = [];
    for (var i = 0; i < ary.length; i++) {
      this._ary_display.push(ary[i]);
      this._colors.push(DEFAULT_COLOR);
    }
    draw_array(this._canvas, this._ary, this._colors);
    var _this = this;
    this._id = window.setInterval(function() {_this._step();}, interval);
  }
  
  AnimatedArray.prototype.cancel = function() {
    /*
     * Cancel animations for any pending actions for this AnimatedArray.
     */
    window.clearInterval(this._id);
  }


  AnimatedArray.prototype._step = function() {
    /*
     * Consumes one step from the action buffer, using it to update
     * the display version of the array and the color array; then
     * draws the display array to the canvas. You should not call this
     * manually.
     */
    if (this._actions.length === 0) {
      draw_array(this._canvas, this._ary_display, this._colors);
      return;
    }
    var action = this._actions.shift();
    var i = action[1];
    var j = action[2];
    if (action[0] === 'compare') {
      this._colors[i] = COMPARE_COLOR;
      this._colors[j] = COMPARE_COLOR;
    } else if (action[0] === 'swap') {
      this._colors[i] = SWAP_COLOR;
      this._colors[j] = SWAP_COLOR;
      var t = this._ary_display[i];
      this._ary_display[i] = this._ary_display[j];
      this._ary_display[j] = t;
    }
    draw_array(this._canvas, this._ary_display, this._colors);
    this._colors[i] = DEFAULT_COLOR;
    this._colors[j] = DEFAULT_COLOR;
  }

  AnimatedArray.prototype.length = function() {
    return this._ary.length;
  }

  //Swap function
  //@params aa - animatedArray
  //@params i - integer of array index to swap with index j
  //@params j - integer of array index to swap with index i
  // switches values in index i with index j
  // tells move stack in animatedArray to add new step
  function swap(aa, i, j){
    var a = aa._ary;
    aa._actions.push(['swap', i, j]);
    var temp = a[i];
    a[i] = a[j];
    a[j] = temp;
  }

  //Performs bubblesort
  //@params aa - AnimatedArray, holds 2 stacks, 1 for actions to take and animate, one as regular javascript array to hold int values
  //  takes an index and compares to next value, if the value is smaller swap
  //  items floating out like a bubble and lands at the end until sorted
  function bubblesort(aa) {
    var a = aa._ary;
    var len = a.length;
    for (var i = 0; i < len; i++) {
      for (var j = 0; j < len - i - 1; j++) {
        if (a[j+1]<a[j]) {
          //add push action to action stack in aa
          // aa._actions.push(['swap', j+1, j]);
          // var temp = a[j+1];
          // a[j+1]=a[j];
          // a[j] = temp;
          swap(aa,j+1, j);
        }
      }
    }
  }

  //Performs selectionSort
  ///@params aa - AnimatedArray, holds 2 stacks, 1 for actions to take and animate, one as regular javascript array to hold int values
  //  loops through the array, every iteration takes the smallest value and placest it in the current iteration position
  //  select the smallest and place in order
  function selectionsort(aa) {
    var a = aa._ary;
    var len = a.length;
    var min;
    for(var i = 0; i < len - 1; i++){
      var compare = a[i];
      for(var j = i; j < len; j++){
        if(a[j] <= compare){
          compare = a[j];
          min = j;
        }
      }
      swap(aa,i,min);
    }
  }

  //Performs insertionSort
  ///@params aa - AnimatedArray, holds 2 stacks, 1 for actions to take and animate, one as regular javascript array to hold int values
  //  loops through the array, if index is smaller than previous, move value back until value before is larger
  // insert the smallest behind values larger than it, like sorting card hands
  function insertionsort(aa) {
    var a = aa._ary;
    var len = a.length;
    for(var i = 1; i < len; i++){
      for(var j = i; j > 0; j--){
        if(a[j] < a[j-1]){
          swap(aa, j, j-1);
        }
      }
    }
  }
  
  //Helper function for quicksort to find pivot point and move values to the correct side of pivot
  //@params aa - AnimatedArray
  //@params first - integer, left index
  //@params last - integer, right index
  function pivots(aa, first, last){
    var a = aa._ary;
    var pivotValue = a[first];
    pivot = first;
    for (var i = first; i < last; i++) {
      if (a[i] < a[last]) {
        if (i != pivot) {
          swap(aa, i, pivot);
        }
        pivot += 1
      }
    }
    swap(aa, last, pivot);

    return pivot;
  }

  //Performs quickSort
  //@params aa - AnimatedArray, holds 2 stacks, 1 for actions to take and animate, one as regular javascript array to hold int values
  //@params first - integer, left marker 
  //@params last - integer, right marker
  //  pick a pivot and move everything smaller to the left and everything larger to the right
  //   repeat until left and right markers are equal or crossed same point
  function quicksort(aa, first, last) {
    if (typeof(first) === 'undefined'){ first = 0; }
    if (typeof(last) === 'undefined'){ last = aa._ary.length - 1; }
    if (first >= last){ return; }

    var pivot = pivots(aa, first, last);

    quicksort(aa, first, pivot - 1);
    quicksort(aa, pivot + 1, last);
  }

  function mergesort(aa, left, right) {

  }

  function heapsort(aa, left, right) {

  } 

  var algorithms = {
    'bubblesort': bubblesort,
    'selectionsort': selectionsort,
    'insertionsort': insertionsort,
    'heapsort': heapsort,
    'quicksort': quicksort,
    'mergesort': mergesort,
  }

  function get_sort_fn(algo, pivot_type) {
    if (!algorithms.hasOwnProperty(algo)) {
      throw 'Invalid algorithm ' + algo;
    }
    return algorithms[algo];
  }
  
  return {
    'AnimatedArray': AnimatedArray,
    'get_sort_fn': get_sort_fn,
    'algorithms': algorithms,
  }

  return _sorting;

})();
