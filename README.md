# JavaScript Object Search

Search JavaScript objects for specific strings or patterns, useful when instrumenting shopping carts and you need to find the order ID in the global scope, for example.

Usage is:

	objectSearch(window, /412/);
	
It returns a list of paths (dot-separated) of keys or values which match, e.g.

	[ "order.orderID", "order.products[2].code" ]

The primary purpose of this is to search the `window` object on a page to see if values used for analytics recording (e.g. order ID, etc.) are stored as a local JavaScript variable.

## Version history

- Fri Jul 28 18:30:49 EDT 2017 - Added to github repo
