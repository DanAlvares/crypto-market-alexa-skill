module.exports = {
	readChange: (value) => {
	    let val = parseFloat(value);

	    if (val > 0) {
	        return ' up ' + val + '%';
	    }
	    if (val < 0) {
	        return ' down ' + Math.abs(val) + '%';
	    }
	    else {
	        return ' no change ';
	    }
	}
}