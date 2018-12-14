// Taken from https://github.com/gauravmehla/ds-with-js/blob/master/src/lib/doubleLinkedList.js

/*
  I implemented three functions to fit my use case and make this DLL circular

  pop()
  rotateClockwise();
  rotateCounterClockwise();

  also implemented map() to aid in debugging
*/

class Node {
	constructor( data ) {
		this.data = data;
		this.next = null;
		this.prev = null;
	}
}

class DoublyLinkedList {
	constructor() {
		this.head = null;
		this.tail = null;	}

	append( item ) {
		let node = new Node( item );

		if(!this.head) {
			this.head = node;
			this.tail = node;
		} else {
			node.prev = this.tail;
			this.tail.next = node;
			this.tail = node
		}
	}

	appendAt( pos, item ) {
		let current = this.head;
		let counter = 1;
		let node = new Node( item );
		if( pos == 0 ) {
			this.head.prev = node
			node.next = this.head
			this.head = node
		} else {
			while(current) {
				current = current.next;
				if( counter == pos ) {
					node.prev = current.prev
					current.prev.next = node
					node.next = current
					current.prev = node
				}
				counter++
			}
		}
	}

	appendAfter( item ) {
		//
	}

	remove( item ) {
		let current = this.head;
		while( current ) {
			if( current.data === item ) {
				if( current == this.head && current == this.tail ) {
					this.head = null;
					this.tail = null;
				} else if ( current == this.head ) {
					this.head = this.head.next
					this.head.prev = null
				} else if ( current == this.tail ) {
					this.tail = this.tail.prev;
					this.tail.next = null;
				} else {
					current.prev.next = current.next;
					current.next.prev = current.prev;
				}
			}
			current = current.next
		}
	}

  pop () {
    const data = this.tail.data;
    this.tail = this.tail.prev;
    this.tail.next = null;
    return data;
  }

	removeAt( pos ) {
		let current = this.head;
		let counter = 1;
		if( pos == 0 ) {
      const data = this.head.data;
			this.head = this.head.next;
			this.head.prev = null;
      return data;
		} else {
			while( current ) {
				current = current.next
				if ( current == this.tail ) {
					this.tail = this.tail.prev;
					this.tail.next = null;
				} else if( counter == pos ) {
          const data = current.prev.next.data;
					current.prev.next = current.next;
					current.next.prev = current.prev;
          return data;
					break;
				}
				counter++;
			}
		}
	}

	reverse(){
		let current = this.head;
		let prev = null;
		while( current ){
			let next = current.next
			current.next = prev
			current.prev = next
			prev = current
			current = next
		}
		this.tail = this.head
		this.head = prev
	}

	swap( nodeOne, nodeTwo ) {
		let current = this.head;
		let counter = 0;
		let firstNode;

		// Make sure we are okay to go
		if( nodeOne === nodeTwo ) {
			console.log("ERROR: 'SWAP' both the nodes must be different!");
			return false;
		} else if( nodeOne > nodeTwo ) {
			let temp = nodeOne;
			nodeOne = nodeTwo;
			nodeTwo = temp;
		}

		if( nodeOne < 0 || nodeTwo < 0 ) {
			console.log("ERROR: 'SWAP' both the nodes must be index & index can not be negative!");
			return false;
		}

		// Swap nodes
		while( current !== null ) {
			if( counter == nodeOne ){
				firstNode = current;
			} else if( counter == nodeTwo ) {
				let temp = current.data;
				current.data = firstNode.data;
				firstNode.data = temp;
			}
			current = current.next;
			counter++;
		}
		return true
	}

	length() {
		let current = this.head;
		let counter = 0;
		while( current !== null ) {
			counter++
			current = current.next
		}
		return counter;
	}

	display() {
		let current = this.head;
		let elements = [];
		while( current !== null ) {
			elements.push( current.data );
			current = current.next
		}
		return elements.join(" ");
	}

	isEmpty() {
		return this.length() < 1
	}

	traverse( fn ) {
		if(!fn || typeof fn !== 'function') {
			console.log("ERROR: 'TRAVERSE' function is undefined!");
			return false;
		}
		let current = this.head;
    let counter = 0;
		while( current !== null ) {
			fn(current, counter)
			current = current.next;
      counter++;
		}
		return true;
	}

  map( fn ) {
		if(!fn || typeof fn !== 'function') {
			console.log("ERROR: 'MAP' function is undefined!");
			return false;
		}
		let current = this.head;
    let counter = 0;
    const results = [];
		while( current !== null ) {
			results.push(fn(current, counter));
			current = current.next;
      counter++;
		}
		return results;
	}

	traverseReverse( fn ) {
		if(!fn || typeof fn !== 'function') {
			console.log("ERROR: 'TRAVERSE_REVERSE' function is undefined!");
			return false;
		}
		let current = this.tail;
		while( current !== null ) {
			fn(current)
			current = current.prev;
		}
		return true;
	}

	search( item ) {
		let current = this.head;
		let counter = 0;

		while( current ) {
			if( current.data == item ) {
				return counter
			}
			current = current.next
			counter++
		}
		return false;
	}

  rotateCounterClockwise(n) {
    if (n === 0) return;
    let counter = 1;
    let current = this.head;
    while (counter < n) {
      current = current.next;
      counter++;
    }
    if (!current || !current.next) return;

    /*
      a  b  c  d  e  f  g  h
      e  f  g  h  a  b  c  d
    */

    const nth = current;
    const newHead = nth.next;
    this.tail.next = this.head;
    this.head.prev = this.tail;
    nth.next = null;
    newHead.prev = null;
    this.tail = nth;
    this.head = newHead;
  }

  rotateClockwise(n) {
    if (n === 0) return;
    let counter = 1;
    let current = this.tail;
    while (counter < n) {
      current = current.prev;
      counter++;
    }
    if (!current || !current.prev) return;

    /*
      a  b  c  d  e  f  g  h
      e  f  g  h  a  b  c  d
    */

    const nth = current;
    const newTail = nth.prev;
    this.tail.next = this.head;
    this.head.prev = this.tail;
    nth.prev = null;
    newTail.next = null;
    this.tail = newTail;
    this.head = nth;
  }

  get( pos ) {
		let current = this.head;
		let counter = 0;

		while( current ) {
			if( counter == pos ) {
				return current.data
			}
			current = current.next
			counter++
		}
		return false;
	}
}

module.exports = DoublyLinkedList
